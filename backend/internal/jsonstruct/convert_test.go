package jsonstruct

import (
	"go/format"
	"strings"
	"testing"
)

func TestConvertGo(t *testing.T) {
	tests := []struct {
		name string
		in   string
		root string
		want string
	}{
		{
			name: "scalars and types",
			in:   `{"name":"a","age":30,"score":9.5,"active":true,"meta":null}`,
			want: "type Root struct {\n" +
				"\tName string `json:\"name\"`\n" +
				"\tAge int `json:\"age\"`\n" +
				"\tScore float64 `json:\"score\"`\n" +
				"\tActive bool `json:\"active\"`\n" +
				"\tMeta interface{} `json:\"meta\"`\n" +
				"}\n",
		},
		{
			name: "nested object becomes a named type",
			in:   `{"user":{"id":1}}`,
			want: "type Root struct {\n" +
				"\tUser User `json:\"user\"`\n" +
				"}\n\n" +
				"type User struct {\n" +
				"\tID int `json:\"id\"`\n" +
				"}\n",
		},
		{
			name: "slice of strings",
			in:   `{"tags":["x","y"]}`,
			want: "type Root struct {\n\tTags []string `json:\"tags\"`\n}\n",
		},
		{
			name: "slice of objects merges fields, singular element name",
			in:   `{"items":[{"a":1},{"b":2}]}`,
			want: "type Root struct {\n" +
				"\tItems []Item `json:\"items\"`\n" +
				"}\n\n" +
				"type Item struct {\n" +
				"\tA int `json:\"a\"`\n" +
				"\tB int `json:\"b\"`\n" +
				"}\n",
		},
		{
			name: "custom root name",
			in:   `{"x":1}`,
			root: "Payload",
			want: "type Payload struct {\n\tX int `json:\"x\"`\n}\n",
		},
		{
			name: "number promotion in array",
			in:   `{"nums":[1,2.5]}`,
			want: "type Root struct {\n\tNums []float64 `json:\"nums\"`\n}\n",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Convert(tt.in, tt.root, "go")
			if err != nil {
				t.Fatalf("Convert error: %v", err)
			}
			// Output is gofmt'd; normalize the expectation the same way so the
			// test is about content, not hand-counted column alignment.
			wantBytes, err := format.Source([]byte(tt.want))
			if err != nil {
				t.Fatalf("format want: %v", err)
			}
			if got != string(wantBytes) {
				t.Errorf("Convert mismatch:\ngot:\n%s\nwant:\n%s", got, wantBytes)
			}
		})
	}
}

func TestConvertLanguages(t *testing.T) {
	in := `{"user_id":1,"tags":["x"]}`
	cases := map[string][]string{
		"typescript": {
			"interface Root {",
			"user_id: number;",
			"tags: string[];",
		},
		"python": {
			"@dataclass",
			"class Root:",
			"user_id: int",
			"tags: List[str]",
		},
		"rust": {
			"pub struct Root {",
			"pub user_id: i64,",
			"pub tags: Vec<String>,",
		},
	}
	for lang, wants := range cases {
		t.Run(lang, func(t *testing.T) {
			got, err := Convert(in, "Root", lang)
			if err != nil {
				t.Fatalf("Convert(%s) error: %v", lang, err)
			}
			for _, w := range wants {
				if !strings.Contains(got, w) {
					t.Errorf("output missing %q:\n%s", w, got)
				}
			}
		})
	}
}

func TestConvertRustRename(t *testing.T) {
	// camelCase key -> snake field + serde rename
	got, err := Convert(`{"userName":"a"}`, "Root", "rust")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(got, `#[serde(rename = "userName")]`) ||
		!strings.Contains(got, "pub user_name: String,") {
		t.Errorf("rust rename not emitted:\n%s", got)
	}
}

func TestConvertErrors(t *testing.T) {
	for _, in := range []string{"", "  ", "{bad", `{} {}`} {
		if _, err := Convert(in, "", "go"); err == nil {
			t.Errorf("Convert(%q) expected error, got nil", in)
		}
	}
	if _, err := Convert(`{"x":1}`, "Root", "cobol"); err == nil {
		t.Error("unsupported language should error")
	}
}

func TestGoName(t *testing.T) {
	cases := map[string]string{
		"user_id":   "UserID",
		"api-key":   "APIKey",
		"firstName": "FirstName",
		"url":       "URL",
		"123abc":    "Field123abc",
		"":          "Field",
	}
	for in, want := range cases {
		if got := goName(in); got != want {
			t.Errorf("goName(%q) = %q, want %q", in, got, want)
		}
	}
}
