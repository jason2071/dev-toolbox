// Command server runs the Dev Toolbox local HTTP API on :8080.
//
// To add a tool: write a module under internal/<name> that returns a
// tool.Tool, then add one registry.Register line below. Nothing else changes.
package main

import (
	"log"

	"devtoolbox/internal/jsonstruct"
	"devtoolbox/internal/jwt"
	"devtoolbox/internal/regex"
	"devtoolbox/internal/tool"

	"github.com/gin-gonic/gin"
)

func main() {
	reg := tool.NewRegistry()

	// --- tool registry: one line per feature module ---
	reg.Register(jsonstruct.New())
	reg.Register(jwt.New())
	reg.Register(regex.New())

	r := gin.Default()
	r.GET("/healthz", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	api := r.Group("/api")
	reg.Mount(api)

	log.Println("dev-toolbox listening on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
