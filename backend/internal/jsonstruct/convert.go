package jsonstruct

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
	"unicode"
)

// Convert turns a JSON document into Go struct definitions. rootName is the
// type name for the top-level value (defaults to "Root" when empty).
//
// Supports nested objects (inline structs), arrays (with element-type
// inference and field union across object elements), and scalar type mapping.
func Convert(jsonSrc, rootName string) (string, error) {
	if strings.TrimSpace(jsonSrc) == "" {
		return "", fmt.Errorf("empty input")
	}
	if rootName == "" {
		rootName = "Root"
	}

	dec := json.NewDecoder(bytes.NewReader([]byte(jsonSrc)))
	dec.UseNumber()
	n, err := parse(dec)
	if err != nil {
		return "", err
	}
	// reject trailing tokens (e.g. "{} {}")
	if dec.More() {
		return "", fmt.Errorf("unexpected trailing data after JSON value")
	}

	var b strings.Builder
	b.WriteString("type ")
	b.WriteString(goName(rootName))
	b.WriteString(" ")
	b.WriteString(emit(n, 0))
	b.WriteString("\n")
	return b.String(), nil
}

type kind int

const (
	kString kind = iota
	kNumber
	kBool
	kNull
	kObject
	kArray
)

type node struct {
	kind    kind
	isFloat bool             // number: float vs int
	keys    []string         // object: insertion order
	props   map[string]*node // object: key -> value
	elems   []*node          // array: elements
}

func parse(dec *json.Decoder) (*node, error) {
	tok, err := dec.Token()
	if err != nil {
		return nil, err
	}
	switch t := tok.(type) {
	case json.Delim:
		switch t {
		case '{':
			return parseObject(dec)
		case '[':
			return parseArray(dec)
		default:
			return nil, fmt.Errorf("unexpected token %q", t)
		}
	case string:
		return &node{kind: kString}, nil
	case json.Number:
		return &node{kind: kNumber, isFloat: isFloat(string(t))}, nil
	case bool:
		return &node{kind: kBool}, nil
	case nil:
		return &node{kind: kNull}, nil
	default:
		return nil, fmt.Errorf("unsupported token type %T", tok)
	}
}

func parseObject(dec *json.Decoder) (*node, error) {
	n := &node{kind: kObject, props: map[string]*node{}}
	for dec.More() {
		keyTok, err := dec.Token()
		if err != nil {
			return nil, err
		}
		key, ok := keyTok.(string)
		if !ok {
			return nil, fmt.Errorf("expected object key, got %T", keyTok)
		}
		val, err := parse(dec)
		if err != nil {
			return nil, err
		}
		if _, dup := n.props[key]; !dup {
			n.keys = append(n.keys, key)
		}
		n.props[key] = val
	}
	if _, err := dec.Token(); err != nil { // consume '}'
		return nil, err
	}
	return n, nil
}

func parseArray(dec *json.Decoder) (*node, error) {
	n := &node{kind: kArray}
	for dec.More() {
		elem, err := parse(dec)
		if err != nil {
			return nil, err
		}
		n.elems = append(n.elems, elem)
	}
	if _, err := dec.Token(); err != nil { // consume ']'
		return nil, err
	}
	return n, nil
}

// emit renders a node as a Go type expression. indent is the current nesting
// depth (in tab levels) for inline struct bodies.
func emit(n *node, indent int) string {
	switch n.kind {
	case kString:
		return "string"
	case kNumber:
		if n.isFloat {
			return "float64"
		}
		return "int"
	case kBool:
		return "bool"
	case kNull:
		return "interface{}"
	case kArray:
		return "[]" + emit(mergeElems(n.elems), indent)
	case kObject:
		return emitStruct(n, indent)
	default:
		return "interface{}"
	}
}

func emitStruct(n *node, indent int) string {
	if len(n.keys) == 0 {
		return "struct{}"
	}
	pad := strings.Repeat("\t", indent+1)
	var b strings.Builder
	b.WriteString("struct {\n")
	for _, key := range n.keys {
		b.WriteString(pad)
		b.WriteString(goName(key))
		b.WriteString(" ")
		b.WriteString(emit(n.props[key], indent+1))
		b.WriteString(" `json:\"")
		b.WriteString(key)
		b.WriteString("\"`\n")
	}
	b.WriteString(strings.Repeat("\t", indent))
	b.WriteString("}")
	return b.String()
}

// mergeElems infers a single element type from array elements. Objects are
// merged by union of keys (so no field is missed); mixed kinds collapse to
// interface{}.
func mergeElems(elems []*node) *node {
	if len(elems) == 0 {
		return &node{kind: kNull} // []interface{}
	}
	first := elems[0].kind
	for _, e := range elems[1:] {
		if e.kind != first {
			return &node{kind: kNull}
		}
	}
	switch first {
	case kObject:
		return mergeObjects(elems)
	case kArray:
		var inner []*node
		for _, e := range elems {
			inner = append(inner, e.elems...)
		}
		return &node{kind: kArray, elems: []*node{mergeElems(inner)}}
	case kNumber:
		// promote to float if any element is float
		for _, e := range elems {
			if e.isFloat {
				return &node{kind: kNumber, isFloat: true}
			}
		}
		return &node{kind: kNumber}
	default:
		return elems[0]
	}
}

func mergeObjects(elems []*node) *node {
	merged := &node{kind: kObject, props: map[string]*node{}}
	for _, e := range elems {
		for _, key := range e.keys {
			if _, seen := merged.props[key]; !seen {
				merged.keys = append(merged.keys, key)
				merged.props[key] = e.props[key]
			} else {
				merged.props[key] = mergeNodes(merged.props[key], e.props[key])
			}
		}
	}
	return merged
}

func mergeNodes(a, b *node) *node {
	if a.kind != b.kind {
		return &node{kind: kNull}
	}
	switch a.kind {
	case kObject:
		return mergeObjects([]*node{a, b})
	case kArray:
		return &node{kind: kArray, elems: append(append([]*node{}, a.elems...), b.elems...)}
	case kNumber:
		return &node{kind: kNumber, isFloat: a.isFloat || b.isFloat}
	default:
		return a
	}
}

func isFloat(num string) bool {
	return strings.ContainsAny(num, ".eE")
}

// commonInitialisms are upper-cased wholesale for idiomatic Go names.
var commonInitialisms = map[string]bool{
	"ID": true, "URL": true, "API": true, "HTTP": true, "JSON": true,
	"UUID": true, "URI": true, "SQL": true, "HTML": true, "IP": true,
}

// goName converts a JSON key into an exported, idiomatic Go identifier.
func goName(key string) string {
	parts := strings.FieldsFunc(key, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	})
	if len(parts) == 0 {
		return "Field"
	}
	var b strings.Builder
	for _, p := range parts {
		up := strings.ToUpper(p)
		if commonInitialisms[up] {
			b.WriteString(up)
			continue
		}
		r := []rune(p)
		r[0] = unicode.ToUpper(r[0])
		b.WriteString(string(r))
	}
	out := b.String()
	if unicode.IsDigit([]rune(out)[0]) {
		out = "Field" + out
	}
	return out
}
