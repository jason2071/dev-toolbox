package tool

import (
	"fmt"
	"sort"

	"github.com/gin-gonic/gin"
)

// Registry is the central catalog of tool modules. Not safe for concurrent
// registration; register all modules at startup before serving.
type Registry struct {
	order []string        // preserves registration order for stable listing
	tools map[string]Tool // id -> module
}

// NewRegistry returns an empty registry.
func NewRegistry() *Registry {
	return &Registry{tools: make(map[string]Tool)}
}

// Register adds a module. Panics on empty or duplicate ID — these are
// programmer errors that must surface at startup, not at request time.
func (r *Registry) Register(t Tool) {
	id := t.ID()
	if id == "" {
		panic("tool: Register called with empty ID")
	}
	if _, dup := r.tools[id]; dup {
		panic(fmt.Sprintf("tool: duplicate registration for ID %q", id))
	}
	r.tools[id] = t
	r.order = append(r.order, id)
}

// Mount wires every registered module's routes under /api/tools/<id> and
// exposes the catalog at GET /api/tools.
func (r *Registry) Mount(api *gin.RouterGroup) {
	api.GET("/tools", func(c *gin.Context) {
		c.JSON(200, r.Catalog())
	})
	for _, id := range r.order {
		t := r.tools[id]
		t.Routes(api.Group("/tools/" + id))
	}
}

// Catalog returns metadata for all tools in registration order.
func (r *Registry) Catalog() []Meta {
	out := make([]Meta, 0, len(r.order))
	for _, id := range r.order {
		t := r.tools[id]
		out = append(out, Meta{ID: t.ID(), Name: t.Name(), Description: t.Description()})
	}
	return out
}

// IDs returns the registered tool IDs, sorted. Useful for tests/diagnostics.
func (r *Registry) IDs() []string {
	ids := make([]string, len(r.order))
	copy(ids, r.order)
	sort.Strings(ids)
	return ids
}
