package httpapi

import (
	"net/http"
	"os"
	"strings"

	"planary-auth/pkg/auth"
	"planary-auth/pkg/httpx"
)

func Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func Config(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	rawOrigins := strings.Split(os.Getenv("ALLOWED_RETURN_TO_ORIGINS"), ",")
	appOrigins := make([]string, 0, len(rawOrigins))
	for _, origin := range rawOrigins {
		trimmed := strings.TrimSpace(origin)
		if trimmed != "" {
			appOrigins = append(appOrigins, strings.TrimRight(trimmed, "/"))
		}
	}

	httpx.JSON(w, http.StatusOK, map[string]any{"appOrigins": appOrigins})
}

func Me(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		httpx.Error(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	user, err := auth.UserFromRequest(r)
	if err != nil {
		httpx.Error(w, http.StatusUnauthorized, "not authenticated")
		return
	}

	httpx.JSON(w, http.StatusOK, map[string]any{"user": user})
}
