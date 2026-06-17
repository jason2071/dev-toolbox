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
	JSON     string `json:"json"`
	RootName string `json:"rootName"`
}

func convert(c *gin.Context) {
	var req convertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	code, err := Convert(req.JSON, req.RootName)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"code": code})
}
