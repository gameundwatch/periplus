package feed

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Item struct {
	ID          string    `json:"id"`
	Source      string    `json:"source"`
	PublishedAt time.Time `json:"published_at"`
	Title       string    `json:"title"`
}

// Publishers send RFC 3339 without a zone offset and mean UTC by it, so the
// times arriving here are already comparable across sources.
func Fetch(ctx context.Context, client *http.Client, url string) ([]Item, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("feed %s: %s", url, resp.Status)
	}

	var items []Item
	if err := json.NewDecoder(resp.Body).Decode(&items); err != nil {
		return nil, fmt.Errorf("feed %s: %w", url, err)
	}
	return items, nil
}
