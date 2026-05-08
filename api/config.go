package handler

import (
	"net/http"

	"planary-auth/pkg/httpapi"
)

func ConfigHandler(w http.ResponseWriter, r *http.Request) {
	httpapi.Config(w, r)
}
