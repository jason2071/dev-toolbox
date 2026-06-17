package jsonstruct

import (
	"strconv"
	"strings"
	"unicode"
)

// This file turns the parsed JSON node tree into named type definitions and
// renders them per target language. Each object becomes a named type (instead
// of an inline/anonymous one) so languages that lack anonymous structs (Rust,
// Python) are supported uniformly.

// typeRef references a type from a field: a scalar kind, a named object, an
// array of some element type, or null/any.
type typeRef struct {
	kind    kind
	isFloat bool
	named   string   // for kObject
	elem    *typeRef // for kArray
}

type tfield struct {
	key string
	ref typeRef
}

type namedType struct {
	name   string
	fields []tfield
}

// collector accumulates named types in declaration order while walking nodes.
type collector struct {
	rootName string
	order    []string
	types    map[string]*namedType
	used     map[string]bool
}

func newCollector() *collector {
	return &collector{types: map[string]*namedType{}, used: map[string]bool{}}
}

// unique returns a PascalCase type name derived from base, suffixing a number
// on collision so every named type is distinct.
func (c *collector) unique(base string) string {
	name := goName(base)
	cand := name
	for i := 2; c.used[cand]; i++ {
		cand = name + strconv.Itoa(i)
	}
	c.used[cand] = true
	return cand
}

// build returns the typeRef for node n, registering any named object types it
// encounters. hint seeds the name for object/array-element types.
func (c *collector) build(n *node, hint string) typeRef {
	switch n.kind {
	case kString:
		return typeRef{kind: kString}
	case kNumber:
		return typeRef{kind: kNumber, isFloat: n.isFloat}
	case kBool:
		return typeRef{kind: kBool}
	case kNull:
		return typeRef{kind: kNull}
	case kArray:
		elem := mergeElems(n.elems)
		er := c.build(elem, singular(hint))
		return typeRef{kind: kArray, elem: &er}
	case kObject:
		name := c.unique(hint)
		nt := &namedType{name: name}
		c.order = append(c.order, name)
		c.types[name] = nt
		for _, key := range n.keys {
			nt.fields = append(nt.fields, tfield{key: key, ref: c.build(n.props[key], key)})
		}
		return typeRef{kind: kObject, named: name}
	default:
		return typeRef{kind: kNull}
	}
}

// emitters renders the collected types for each supported language.
var emitters = map[string]func(*collector, typeRef) string{
	"go":         emitGo,
	"typescript": emitTS,
	"python":     emitPy,
	"rust":       emitRust,
}

// ── Go ───────────────────────────────────────────
func emitGo(c *collector, root typeRef) string {
	var b strings.Builder
	for i, name := range c.order {
		if i > 0 {
			b.WriteString("\n")
		}
		b.WriteString("type " + name + " struct {\n")
		for _, f := range c.types[name].fields {
			b.WriteString("\t" + goName(f.key) + " " + goType(f.ref) +
				" `json:\"" + f.key + "\"`\n")
		}
		b.WriteString("}\n")
	}
	if root.kind != kObject {
		b.WriteString("\ntype " + c.rootName + " " + goType(root) + "\n")
	}
	return b.String()
}

func goType(r typeRef) string {
	switch r.kind {
	case kString:
		return "string"
	case kNumber:
		if r.isFloat {
			return "float64"
		}
		return "int"
	case kBool:
		return "bool"
	case kObject:
		return r.named
	case kArray:
		return "[]" + goType(*r.elem)
	default:
		return "interface{}"
	}
}

// ── TypeScript ───────────────────────────────────
func emitTS(c *collector, root typeRef) string {
	var b strings.Builder
	for i, name := range c.order {
		if i > 0 {
			b.WriteString("\n")
		}
		b.WriteString("interface " + name + " {\n")
		for _, f := range c.types[name].fields {
			b.WriteString("  " + tsKey(f.key) + ": " + tsType(f.ref) + ";\n")
		}
		b.WriteString("}\n")
	}
	if root.kind != kObject {
		b.WriteString("\ntype " + c.rootName + " = " + tsType(root) + ";\n")
	}
	return b.String()
}

func tsType(r typeRef) string {
	switch r.kind {
	case kString:
		return "string"
	case kNumber:
		return "number"
	case kBool:
		return "boolean"
	case kObject:
		return r.named
	case kArray:
		return tsType(*r.elem) + "[]"
	default:
		return "any"
	}
}

func tsKey(k string) string {
	if isIdent(k) {
		return k
	}
	return strconv.Quote(k)
}

// ── Python (dataclasses) ─────────────────────────
func emitPy(c *collector, root typeRef) string {
	var b strings.Builder
	b.WriteString("from __future__ import annotations\n")
	b.WriteString("from dataclasses import dataclass\n")
	b.WriteString("from typing import Any, List\n\n")
	for i, name := range c.order {
		if i > 0 {
			b.WriteString("\n")
		}
		b.WriteString("@dataclass\nclass " + name + ":\n")
		fields := c.types[name].fields
		if len(fields) == 0 {
			b.WriteString("    pass\n")
			continue
		}
		for _, f := range fields {
			b.WriteString("    " + safeIdent(f.key) + ": " + pyType(f.ref) + "\n")
		}
	}
	if root.kind != kObject {
		b.WriteString("\n" + c.rootName + " = " + pyType(root) + "\n")
	}
	return b.String()
}

func pyType(r typeRef) string {
	switch r.kind {
	case kString:
		return "str"
	case kNumber:
		if r.isFloat {
			return "float"
		}
		return "int"
	case kBool:
		return "bool"
	case kObject:
		return r.named
	case kArray:
		return "List[" + pyType(*r.elem) + "]"
	default:
		return "Any"
	}
}

// ── Rust (serde) ─────────────────────────────────
func emitRust(c *collector, root typeRef) string {
	var b strings.Builder
	b.WriteString("use serde::{Deserialize, Serialize};\n\n")
	for i, name := range c.order {
		if i > 0 {
			b.WriteString("\n")
		}
		b.WriteString("#[derive(Debug, Serialize, Deserialize)]\n")
		b.WriteString("pub struct " + name + " {\n")
		for _, f := range c.types[name].fields {
			fname := snake(f.key)
			if fname != f.key {
				b.WriteString("    #[serde(rename = \"" + f.key + "\")]\n")
			}
			b.WriteString("    pub " + fname + ": " + rustType(f.ref) + ",\n")
		}
		b.WriteString("}\n")
	}
	if root.kind != kObject {
		b.WriteString("\npub type " + c.rootName + " = " + rustType(root) + ";\n")
	}
	return b.String()
}

func rustType(r typeRef) string {
	switch r.kind {
	case kString:
		return "String"
	case kNumber:
		if r.isFloat {
			return "f64"
		}
		return "i64"
	case kBool:
		return "bool"
	case kObject:
		return r.named
	case kArray:
		return "Vec<" + rustType(*r.elem) + ">"
	default:
		return "serde_json::Value"
	}
}

// ── helpers ──────────────────────────────────────

// singular strips a trailing plural "s" so an array field like "items" yields
// an element type named "Item". Conservative: leaves "ss" endings alone.
func singular(s string) string {
	if len(s) > 1 && strings.HasSuffix(s, "s") && !strings.HasSuffix(s, "ss") {
		return s[:len(s)-1]
	}
	return s
}

func isIdent(s string) bool {
	if s == "" {
		return false
	}
	for i, r := range s {
		if r == '_' || unicode.IsLetter(r) || (i > 0 && unicode.IsDigit(r)) {
			continue
		}
		return false
	}
	return true
}

func safeIdent(s string) string {
	if isIdent(s) {
		return s
	}
	var b strings.Builder
	for _, r := range s {
		if r == '_' || unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(r)
		} else {
			b.WriteByte('_')
		}
	}
	out := b.String()
	if out == "" {
		return "_"
	}
	if unicode.IsDigit([]rune(out)[0]) {
		out = "_" + out
	}
	return out
}

// snake converts a key to snake_case for idiomatic Rust field names.
func snake(s string) string {
	var b strings.Builder
	prevLower := false
	for i, r := range s {
		switch {
		case r >= 'A' && r <= 'Z':
			if i > 0 && prevLower {
				b.WriteByte('_')
			}
			b.WriteRune(unicode.ToLower(r))
			prevLower = false
		case (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9'):
			b.WriteRune(r)
			prevLower = r >= 'a' && r <= 'z'
		default:
			b.WriteByte('_')
			prevLower = false
		}
	}
	out := b.String()
	if out == "" {
		return "_"
	}
	if out[0] >= '0' && out[0] <= '9' {
		out = "_" + out
	}
	return out
}
