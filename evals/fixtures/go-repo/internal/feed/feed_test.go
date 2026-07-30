package feed

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestFetchDecodesItems(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`[{"id":"1","source":"a","published_at":"2026-01-01T00:00:00Z","title":"t"}]`))
	}))
	defer srv.Close()

	items, err := Fetch(context.Background(), srv.Client(), srv.URL)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 1 || items[0].ID != "1" {
		t.Fatalf("got %v", items)
	}
}
