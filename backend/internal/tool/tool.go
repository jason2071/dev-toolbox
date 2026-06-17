// Package tool defines the module contract and the central registry.
//
// Architecture: every feature (JSON→struct, JWT decode, regex test) is a
// self-contained module that implements Tool and registers itself. Adding a
// new feature means writing a module and calling Register once — no existing
// code changes. The registry mounts each module under /api/tools/<id>.
package tool

import "github.com/gin-gonic/gin"

// Tool is the contract every feature module implements.
type Tool interface {
	// ID is the stable, URL-safe identifier (e.g. "jsonstruct").
	// Routes mount under /api/tools/<ID>.
	ID() string

	// Name is the human-readable label shown in the UI sidebar.
	Name() string

	// Description is a one-line summary of what the tool does.
	Description() string

	// Routes registers the module's HTTP handlers on the given group.
	// The group is already scoped to /api/tools/<ID>.
	Routes(g *gin.RouterGroup)
}

// Meta is the public metadata for a tool, returned by the catalog endpoint
// so the frontend can build its registry/sidebar dynamically.
type Meta struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
