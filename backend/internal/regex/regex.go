// Package regex is the "regex tester" tool module (Phase 1).
// Logic is a stub; the architecture wiring is complete.
package regex

import (
	"devtoolbox/internal/tool"

	"github.com/gin-gonic/gin"
)

type module struct{}

// New returns the regex tool module.
func New() tool.Tool { return module{} }

func (module) ID() string          { return "regex" }
func (module) Name() string        { return "Regex Tester" }
func (module) Description() string { return "Test a regex against input and view matches" }

func (module) Routes(g *gin.RouterGroup) {
	g.POST("/test", test)
}

type testRequest struct {
	Pattern string `json:"pattern"`
	Input   string `json:"input"`
}

func test(c *gin.Context) {
	var req testRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	// TODO(phase1): compile pattern, return matches + groups.
	c.JSON(501, gin.H{"error": "not implemented"})
}
