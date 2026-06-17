// Package jwt is the "JWT decoder" tool module (Phase 1).
// Logic is a stub; the architecture wiring is complete.
package jwt

import (
	"devtoolbox/internal/tool"

	"github.com/gin-gonic/gin"
)

type module struct{}

// New returns the jwt tool module.
func New() tool.Tool { return module{} }

func (module) ID() string          { return "jwt" }
func (module) Name() string        { return "JWT Decoder" }
func (module) Description() string { return "Decode a JWT and compare exp against now" }

func (module) Routes(g *gin.RouterGroup) {
	g.POST("/decode", decode)
}

type decodeRequest struct {
	Token string `json:"token"`
}

func decode(c *gin.Context) {
	var req decodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	// TODO(phase1): decode header/payload, surface exp vs current time.
	c.JSON(501, gin.H{"error": "not implemented"})
}
