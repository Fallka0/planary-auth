package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

var ErrUnauthorized = errors.New("unauthorized")

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"createdAt"`
}

type userResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

func supabaseURL() (string, error) {
	value := strings.TrimRight(strings.TrimSpace(os.Getenv("SUPABASE_URL")), "/")
	if value == "" {
		return "", errors.New("SUPABASE_URL is required")
	}
	return value, nil
}

func supabaseAnonKey() (string, error) {
	value := strings.TrimSpace(os.Getenv("SUPABASE_ANON_KEY"))
	if value == "" {
		return "", errors.New("SUPABASE_ANON_KEY is required")
	}
	return value, nil
}

func UserFromRequest(r *http.Request) (User, error) {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return User{}, ErrUnauthorized
	}

	token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	if token == "" {
		return User{}, ErrUnauthorized
	}

	return userFromAccessToken(r.Context(), token)
}

func userFromAccessToken(ctx context.Context, token string) (User, error) {
	url, err := supabaseURL()
	if err != nil {
		return User{}, err
	}

	apiKey, err := supabaseAnonKey()
	if err != nil {
		return User{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url+"/auth/v1/user", nil)
	if err != nil {
		return User{}, fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("apikey", apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return User{}, fmt.Errorf("validate session: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode == http.StatusUnauthorized || res.StatusCode == http.StatusForbidden {
		return User{}, ErrUnauthorized
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return User{}, fmt.Errorf("supabase auth returned status %d", res.StatusCode)
	}

	var payload userResponse
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		return User{}, fmt.Errorf("decode user: %w", err)
	}
	if payload.ID == "" {
		return User{}, ErrUnauthorized
	}

	return User{
		ID:        payload.ID,
		Email:     payload.Email,
		CreatedAt: payload.CreatedAt,
	}, nil
}
