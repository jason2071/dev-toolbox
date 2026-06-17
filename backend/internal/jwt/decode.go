package jwt

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// Result is the decoded JWT, returned to the UI.
type Result struct {
	Header    map[string]any `json:"header"`
	Payload   map[string]any `json:"payload"`
	Signature string         `json:"signature"` // raw base64url segment, not verified
	Expiry    *ExpiryInfo    `json:"expiry,omitempty"`
}

// ExpiryInfo summarizes the exp claim relative to a reference time.
type ExpiryInfo struct {
	ExpiresAt   time.Time `json:"expiresAt"`
	Expired     bool      `json:"expired"`
	SecondsLeft int64     `json:"secondsLeft"` // negative if already expired
}

// Decode parses a JWT without verifying its signature and, when an exp claim
// is present, compares it against now. Signature verification is out of scope:
// this is an offline inspection tool, not an auth gate.
func Decode(token string, now time.Time) (*Result, error) {
	token = strings.TrimSpace(token)
	if token == "" {
		return nil, fmt.Errorf("empty token")
	}
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid JWT: expected 3 segments, got %d", len(parts))
	}

	header, err := decodeSegment(parts[0])
	if err != nil {
		return nil, fmt.Errorf("header: %w", err)
	}
	payload, err := decodeSegment(parts[1])
	if err != nil {
		return nil, fmt.Errorf("payload: %w", err)
	}

	res := &Result{Header: header, Payload: payload, Signature: parts[2]}

	if exp, ok := numericClaim(payload, "exp"); ok {
		expAt := time.Unix(exp, 0).UTC()
		res.Expiry = &ExpiryInfo{
			ExpiresAt:   expAt,
			Expired:     !now.Before(expAt),
			SecondsLeft: exp - now.Unix(),
		}
	}
	return res, nil
}

func decodeSegment(seg string) (map[string]any, error) {
	raw, err := base64.RawURLEncoding.DecodeString(seg)
	if err != nil {
		return nil, fmt.Errorf("invalid base64url: %w", err)
	}
	var out map[string]any
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, fmt.Errorf("invalid JSON: %w", err)
	}
	return out, nil
}

// numericClaim extracts an integer-valued claim. JSON numbers decode to
// float64, so accept that and json.Number defensively.
func numericClaim(m map[string]any, key string) (int64, bool) {
	v, ok := m[key]
	if !ok {
		return 0, false
	}
	switch n := v.(type) {
	case float64:
		return int64(n), true
	case json.Number:
		i, err := n.Int64()
		return i, err == nil
	default:
		return 0, false
	}
}
