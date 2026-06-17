package tool

import (
	"testing"

	"github.com/gin-gonic/gin"
)

type fakeTool struct{ id string }

func (f fakeTool) ID() string              { return f.id }
func (f fakeTool) Name() string            { return f.id }
func (f fakeTool) Description() string     { return f.id }
func (f fakeTool) Routes(*gin.RouterGroup) {}

func TestRegisterAndCatalogPreservesOrder(t *testing.T) {
	r := NewRegistry()
	r.Register(fakeTool{id: "b"})
	r.Register(fakeTool{id: "a"})
	r.Register(fakeTool{id: "c"})

	cat := r.Catalog()
	want := []string{"b", "a", "c"}
	if len(cat) != len(want) {
		t.Fatalf("catalog len = %d, want %d", len(cat), len(want))
	}
	for i, m := range cat {
		if m.ID != want[i] {
			t.Errorf("catalog[%d].ID = %q, want %q", i, m.ID, want[i])
		}
	}
}

func TestRegisterDuplicatePanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Fatal("expected panic on duplicate ID")
		}
	}()
	r := NewRegistry()
	r.Register(fakeTool{id: "dup"})
	r.Register(fakeTool{id: "dup"})
}

func TestRegisterEmptyIDPanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Fatal("expected panic on empty ID")
		}
	}()
	NewRegistry().Register(fakeTool{id: ""})
}
