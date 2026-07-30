use serde::Deserialize;

pub const API_ROOT: &str = "https://api.example-exchange.com/v3";

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct Quote {
    pub symbol: String,
    pub price_cents: i64,
    pub as_of_ms: i64,
}

#[derive(Debug)]
pub enum FeedError {
    Http(String),
    Decode(String),
}

// The exchange reports prices in the venue's minor unit, and the venue is not
// part of the response. Anything crossing venues has to be converted upstream.
pub fn parse_quotes(body: &str) -> Result<Vec<Quote>, FeedError> {
    serde_json::from_str(body).map_err(|e| FeedError::Decode(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_a_quote_list() {
        let body = r#"[{"symbol":"AAA","price_cents":1234,"as_of_ms":1}]"#;
        let quotes = parse_quotes(body).unwrap();
        assert_eq!(quotes[0].price_cents, 1234);
    }
}
