package jsonstruct

import "testing"

func TestConvert(t *testing.T) {
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
			name: "nested object",
			in:   `{"user":{"id":1}}`,
			want: "type Root struct {\n" +
				"\tUser struct {\n" +
				"\t\tID int `json:\"id\"`\n" +
				"\t} `json:\"user\"`\n" +
				"}\n",
		},
		{
			name: "slice of strings",
			in:   `{"tags":["x","y"]}`,
			want: "type Root struct {\n" +
				"\tTags []string `json:\"tags\"`\n" +
				"}\n",
		},
		{
			name: "slice of objects merges fields",
			in:   `{"items":[{"a":1},{"b":2}]}`,
			want: "type Root struct {\n" +
				"\tItems []struct {\n" +
				"\t\tA int `json:\"a\"`\n" +
				"\t\tB int `json:\"b\"`\n" +
				"\t} `json:\"items\"`\n" +
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
			got, err := Convert(tt.in, tt.root)
			if err != nil {
				t.Fatalf("Convert error: %v", err)
			}
			if got != tt.want {
				t.Errorf("Convert mismatch:\ngot:\n%s\nwant:\n%s", got, tt.want)
			}
		})
	}
}

func TestConvertErrors(t *testing.T) {
	for _, in := range []string{"", "  ", "{bad", `{} {}`} {
		if _, err := Convert(in, ""); err == nil {
			t.Errorf("Convert(%q) expected error, got nil", in)
		}
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
