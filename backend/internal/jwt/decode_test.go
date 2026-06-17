package jwt

import (
	"encoding/base64"
	"encoding/json"
	"testing"
	"time"
)

// makeToken builds an unsigned-style JWT (sig is a fixed dummy segment).
func makeToken(t *testing.T, header, payload map[string]any) string {
	t.Helper()
	enc := func(m map[string]any) string {
		b, err := json.Marshal(m)
		if err != nil {
			t.Fatal(err)
		}
		return base64.RawURLEncoding.EncodeToString(b)
	}
	return enc(header) + "." + enc(payload) + ".sig"
}

func TestDecodeExpiry(t *testing.T) {
	now := time.Unix(1_000_000, 0).UTC()
	tok := makeToken(t,
		map[string]any{"alg": "HS256", "typ": "JWT"},
		map[string]any{"sub": "u1", "exp": 1_000_060}, // 60s in the future
	)

	res, err := Decode(tok, now)
	if err != nil {
		t.Fatalf("Decode error: %v", err)
	}
	if res.Header["alg"] != "HS256" {
		t.Errorf("alg = %v, want HS256", res.Header["alg"])
	}
	if res.Payload["sub"] != "u1" {
		t.Errorf("sub = %v, want u1", res.Payload["sub"])
	}
	if res.Expiry == nil {
		t.Fatal("expected expiry info")
	}
	if res.Expiry.Expired {
		t.Error("token should not be expired")
	}
	if res.Expiry.SecondsLeft != 60 {
		t.Errorf("SecondsLeft = %d, want 60", res.Expiry.SecondsLeft)
	}
}

func TestDecodeExpired(t *testing.T) {
	now := time.Unix(1_000_000, 0).UTC()
	tok := makeToken(t,
		map[string]any{"alg": "none"},
		map[string]any{"exp": 999_900}, // 100s in the past
	)
	res, err := Decode(tok, now)
	if err != nil {
		t.Fatal(err)
	}
	if !res.Expiry.Expired {
		t.Error("token should be expired")
	}
	if res.Expiry.SecondsLeft != -100 {
		t.Errorf("SecondsLeft = %d, want -100", res.Expiry.SecondsLeft)
	}
}

func TestDecodeNoExp(t *testing.T) {
	tok := makeToken(t, map[string]any{"alg": "none"}, map[string]any{"sub": "x"})
	res, err := Decode(tok, time.Unix(0, 0))
	if err != nil {
		t.Fatal(err)
	}
	if res.Expiry != nil {
		t.Error("expected nil expiry when no exp claim")
	}
}

func TestDecodeErrors(t *testing.T) {
	cases := []string{
		"",
		"only.two",
		"a.b.c.d",
		"!!!.payload.sig", // bad base64 header
		"e30.!!!.sig",     // bad base64 payload
	}
	for _, in := range cases {
		if _, err := Decode(in, time.Now()); err == nil {
			t.Errorf("Decode(%q) expected error", in)
		}
	}
}
