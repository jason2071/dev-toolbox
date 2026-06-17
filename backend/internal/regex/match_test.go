package regex

import "testing"

func TestTestMatches(t *testing.T) {
	res, err := Test(`\d+`, "a12 b345", false, false)
	if err != nil {
		t.Fatal(err)
	}
	if res.Count != 2 {
		t.Fatalf("count = %d, want 2", res.Count)
	}
	if res.Matches[0].Text != "12" || res.Matches[1].Text != "345" {
		t.Errorf("matches = %+v", res.Matches)
	}
	if res.Matches[1].Start != 5 {
		t.Errorf("second match start = %d, want 5", res.Matches[1].Start)
	}
}

func TestTestNamedGroups(t *testing.T) {
	res, err := Test(`(?P<year>\d{4})-(?P<month>\d{2})`, "2026-06", false, false)
	if err != nil {
		t.Fatal(err)
	}
	if res.Count != 1 {
		t.Fatalf("count = %d, want 1", res.Count)
	}
	g := res.Matches[0].Groups
	if len(g) != 2 {
		t.Fatalf("groups = %d, want 2", len(g))
	}
	if g[0].Name != "year" || g[0].Text != "2026" {
		t.Errorf("group0 = %+v", g[0])
	}
	if g[1].Name != "month" || g[1].Text != "06" {
		t.Errorf("group1 = %+v", g[1])
	}
}

func TestTestIgnoreCase(t *testing.T) {
	res, err := Test(`abc`, "ABC abc", true, false)
	if err != nil {
		t.Fatal(err)
	}
	if res.Count != 2 {
		t.Errorf("count = %d, want 2", res.Count)
	}
}

func TestTestOptionalGroupNotMatched(t *testing.T) {
	res, err := Test(`a(x)?b`, "ab", false, false)
	if err != nil {
		t.Fatal(err)
	}
	g := res.Matches[0].Groups[0]
	if g.Matched {
		t.Errorf("optional group should not have matched: %+v", g)
	}
}

func TestTestErrors(t *testing.T) {
	if _, err := Test("", "x", false, false); err == nil {
		t.Error("empty pattern should error")
	}
	if _, err := Test("(", "x", false, false); err == nil {
		t.Error("invalid pattern should error")
	}
}

func TestTestNoMatch(t *testing.T) {
	res, err := Test(`z`, "abc", false, false)
	if err != nil {
		t.Fatal(err)
	}
	if res.Count != 0 || len(res.Matches) != 0 {
		t.Errorf("expected no matches, got %+v", res)
	}
}
