#!/bin/bash
set -e

# -------------------------------------------------------
# EmpireCrafting Modular Deploy Script
#
# Handles CI/CD builds, linting, Docker push, and GitOps updates.
# Sources configuration from deploy.conf.
# -------------------------------------------------------

# --- Configuration and Setup ---

# Color codes for logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging helpers
log() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; exit 1; }

# Exit trap for error handling
trap 'error "An unexpected error occurred. Exiting."' ERR

# Load configuration
CONFIG_FILE="$(dirname "$0")/deploy.conf"
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    log "Loaded configuration from $CONFIG_FILE"
else
    error "Configuration file not found: $CONFIG_FILE"
fi

# Check for yq dependency
if ! command -v yq &> /dev/null; then
    error "'yq' is not installed. Please install it to proceed. (e.g., sudo snap install yq)"
fi

# --- Git and Branching ---

BRANCH=$(git rev-parse --abbrev-ref HEAD)
SHORT_COMMIT=$(git rev-parse --short HEAD)
log "Current branch: $BRANCH, Commit: $SHORT_COMMIT"

# Determine image tags, GitOps target branch, and ingress host
if [[ "$BRANCH" =~ ^(feature|bugfix)/.* || "$BRANCH" == "develop" ]]; then
    BASE_BRANCH="develop"
    IMAGE_TAG="develop-$SHORT_COMMIT"
    INGRESS_HOST=$INGRESS_HOST_DEV
elif [[ "$BRANCH" =~ ^release/([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    BASE_BRANCH="release"
    IMAGE_TAG="${BASH_REMATCH[1]}" # Extract version from branch name
    INGRESS_HOST=$INGRESS_HOST_PROD
else
    error "Unknown branch '$BRANCH'. Allowed: feature/*, bugfix/*, develop, release/x.y.z"
fi

log "GitOps Base Branch: $BASE_BRANCH"
log "Docker Image Tag: $IMAGE_TAG"
log "Ingress Host: $INGRESS_HOST"

# --- Quality Gates ---

lint_backend() {
    log "Linting backend code with Cargo Clippy..."
    (cd application/src/backend && cargo clippy -- -D warnings)
    success "Backend linting passed."
}

lint_frontend() {
    log "Linting frontend code with ESLint..."
    (cd application/src/frontend && npm install && npm run lint)
    success "Frontend linting passed."
}

# --- Docker Build & Push ---

build_backend() {
    local full_image_name="$DOCKER_REGISTRY/$BACKEND_IMAGE_NAME:$IMAGE_TAG"
    log "Building backend Docker image: $full_image_name"
    docker build -t "$full_image_name" -f application/src/backend/Dockerfile .
    log "Pushing backend image..."
    docker push "$full_image_name"
    success "Backend image pushed."
}

build_frontend() {
    local full_image_name="$DOCKER_REGISTRY/$FRONTEND_IMAGE_NAME:$IMAGE_TAG"
    log "Building frontend Docker image: $full_image_name"
    # No more build-time args for the frontend URL!
    docker build -t "$full_image_name" -f application/src/frontend/Dockerfile .
    log "Pushing frontend image..."
    docker push "$full_image_name"
    success "Frontend image pushed."
}

# --- GitOps Update ---

update_gitops() {
    log "Updating GitOps repository: $GITOPS_REPO_URL"

    # Clone or update the GitOps repo
    [ -d "$GITOPS_REPO_PATH" ] || git clone "$GITOPS_REPO_URL" "$GITOPS_REPO_PATH"
    (cd "$GITOPS_REPO_PATH" && git checkout "$BASE_BRANCH" && git pull)

    # Use yq to safely update the YAML manifest
    local manifest_path="$GITOPS_REPO_PATH/$GITOPS_APP_PATH"
    log "Updating manifest: $manifest_path"

    yq e -i ".spec.rules[0].host = \"$INGRESS_HOST\"" "$manifest_path"
    yq e -i ".spec.template.spec.containers[0].image = \"$DOCKER_REGISTRY/$BACKEND_IMAGE_NAME:$IMAGE_TAG\"" "$manifest_path"
    yq e -i ".spec.template.spec.containers[1].image = \"$DOCKER_REGISTRY/$FRONTEND_IMAGE_NAME:$IMAGE_TAG\"" "$manifest_path"

    # Commit and push changes
    (cd "$GITOPS_REPO_PATH" && \
        git add "$GITOPS_APP_PATH" && \
        git commit -m "Update EmpireCrafting ($BASE_BRANCH): $IMAGE_TAG" && \
        git push origin "$BASE_BRANCH")

    success "GitOps repo updated. Flux will reconcile shortly."
}

# --- Main Script Logic ---

main() {
    local arg="${1:---all}"

    case "$arg" in
        --all)
            lint_backend
            lint_frontend
            build_backend
            build_frontend
            update_gitops
            ;; 
        --backend)
            lint_backend
            build_backend
            ;; 
        --frontend)
            lint_frontend
            build_frontend
            ;; 
        --release)
            lint_backend
            lint_frontend
            build_backend
            build_frontend
            update_gitops
            ;; 
        *)
            error "Usage: $0 [--all|--backend|--frontend|--release]"
            ;; 
    esac

    success "Deployment finished successfully."
}

main "$@"
# ----------------------------
# Notes / process reminders:
# ----------------------------
# 1. Feature/bugfix branches → merge into develop when ready
# 2. Develop branch → builds dev images, optionally tested internally
# 3. Release branch (release/x.y.z) → canonical releases, versioned Docker images
# 4. Always update cluster-config GitOps repo for Flux after release/develop build
# 5. Flux automatically applies updated manifests; check with:
#    kubectl get kustomizations -A
# 6. For develop branch, ingress host is automatically adjusted to empire-dev.*
# 7. Docker registry: 192.168.1.11:5000
