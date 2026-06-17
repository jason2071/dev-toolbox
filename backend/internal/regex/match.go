package regex

import (
	"fmt"
	"regexp"
)

// Result is the outcome of running a pattern against input.
type Result struct {
	Matches []Match `json:"matches"`
	Count   int     `json:"count"`
}

// Match is a single (possibly global) match with its capture groups.
type Match struct {
	Text   string  `json:"text"`   // full matched text
	Start  int     `json:"start"`  // byte offset, inclusive
	End    int     `json:"end"`    // byte offset, exclusive
	Groups []Group `json:"groups"` // capture groups 1..n (group 0 omitted)
}

// Group is one capture group. Name is "" for unnamed groups. Matched is false
// when the group did not participate in the match.
type Group struct {
	Index   int    `json:"index"`
	Name    string `json:"name,omitempty"`
	Text    string `json:"text"`
	Matched bool   `json:"matched"`
}

// Test compiles pattern (Go RE2 syntax) and returns all matches in input.
// flagsIgnoreCase / flagsMultiline toggle the corresponding inline flags.
func Test(pattern, input string, ignoreCase, multiline bool) (*Result, error) {
	if pattern == "" {
		return nil, fmt.Errorf("empty pattern")
	}
	expr := pattern
	if prefix := flagPrefix(ignoreCase, multiline); prefix != "" {
		expr = prefix + pattern
	}
	re, err := regexp.Compile(expr)
	if err != nil {
		return nil, fmt.Errorf("invalid pattern: %w", err)
	}

	names := re.SubexpNames()
	locs := re.FindAllStringSubmatchIndex(input, -1)

	res := &Result{Matches: []Match{}}
	for _, loc := range locs {
		m := Match{
			Text:   input[loc[0]:loc[1]],
			Start:  loc[0],
			End:    loc[1],
			Groups: []Group{},
		}
		// loc holds pairs: [0,1]=full, [2,3]=group1, ...
		for g := 1; g*2 < len(loc); g++ {
			s, e := loc[2*g], loc[2*g+1]
			grp := Group{Index: g, Name: names[g]}
			if s >= 0 && e >= 0 {
				grp.Text = input[s:e]
				grp.Matched = true
			}
			m.Groups = append(m.Groups, grp)
		}
		res.Matches = append(res.Matches, m)
	}
	res.Count = len(res.Matches)
	return res, nil
}

func flagPrefix(ignoreCase, multiline bool) string {
	flags := ""
	if ignoreCase {
		flags += "i"
	}
	if multiline {
		flags += "m"
	}
	if flags == "" {
		return ""
	}
	return "(?" + flags + ")"
}
