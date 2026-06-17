// Package jsonstruct is the "JSON → Go struct" tool module (Phase 1).
// Logic is a stub; the architecture wiring is complete.
package jsonstruct

import (
	"devtoolbox/internal/tool"

	"github.com/gin-gonic/gin"
)

type module struct{}

// New returns the jsonstruct tool module.
func New() tool.Tool { return module{} }

func (module) ID() string          { return "jsonstruct" }
func (module) Name() string        { return "JSON → Go Struct" }
func (module) Description() string { return "Convert JSON into Go struct definitions" }

func (module) Routes(g *gin.RouterGroup) {
	g.POST("/convert", convert)
}

type convertRequest struct {
	JSON string `json:"json"`
}

func convert(c *gin.Context) {
	var req convertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	// TODO(phase1): real JSON→struct conversion (nested, slice, type mapping).
	c.JSON(501, gin.H{"error": "not implemented"})
}
