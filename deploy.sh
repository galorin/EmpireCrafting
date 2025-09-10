#!/bin/bash
set -e

# -------------------------------------------------------
# EmpireCrafting deploy.sh
# Handles CI/CD builds, Docker push, and GitOps updates
# Supports develop, feature/bugfix, and release/x.y.z workflows
# -------------------------------------------------------

# Color codes for logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging helpers
log() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# Exit trap
trap 'error "An error occurred. Exiting."' ERR

# ----------------------------
# Determine current Git branch
# ----------------------------
BRANCH=$(git rev-parse --abbrev-ref HEAD)
SHORT_COMMIT=$(git rev-parse --short HEAD)
log "Current branch: $BRANCH"

# ----------------------------
# Determine image tags and GitOps target branch
# ----------------------------
if [[ "$BRANCH" =~ ^feature/.* || "$BRANCH" =~ ^bugfix/.* ]]; then
    # Feature or bugfix branch → deploy to develop environment
    BASE_BRANCH="develop"
    BACKEND_TAG="develop-$SHORT_COMMIT"
    FRONTEND_TAG="develop-$SHORT_COMMIT"
    INGRESS_SUFFIX="-dev"
elif [[ "$BRANCH" == "develop" ]]; then
    BASE_BRANCH="develop"
    BACKEND_TAG="develop-$SHORT_COMMIT"
    FRONTEND_TAG="develop-$SHORT_COMMIT"
    INGRESS_SUFFIX="-dev"
elif [[ "$BRANCH" =~ ^release/[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Canonical release branch: extract version number
    BASE_BRANCH="release"
    VERSION="${BRANCH#release/}"   # strips 'release/' → '1.0.0'
    BACKEND_TAG="$VERSION"
    FRONTEND_TAG="$VERSION"
    INGRESS_SUFFIX=""
else
    error "Unknown branch '$BRANCH'. Allowed: feature/*, bugfix/*, develop, release/x.y.z"
    exit 1
fi

log "Base branch for GitOps: $BASE_BRANCH"
log "Docker image tags: backend=$BACKEND_TAG, frontend=$FRONTEND_TAG"

# ----------------------------
# Docker build & push functions
# ----------------------------
build_backend() {
    log "Building backend Docker image..."
    docker build -t empire-project-backend:latest -f application/src/backend/Dockerfile .
    docker tag empire-project-backend:latest 192.168.1.11:5000/empire-project-backend:$BACKEND_TAG
    log "Pushing backend image..."
    docker push 192.168.1.11:5000/empire-project-backend:$BACKEND_TAG
    success "Backend image pushed: $BACKEND_TAG"
}

build_frontend() {
    log "Building frontend Docker image..."
    docker build -t empire-project-frontend:latest -f application/src/frontend/Dockerfile --build-arg VITE_API_BASE_URL=http://192.168.1.11 .
    docker tag empire-project-frontend:latest 192.168.1.11:5000/empire-project-frontend:$FRONTEND_TAG
    docker push 192.168.1.11:5000/empire-project-frontend:$FRONTEND_TAG
    success "Frontend image pushed: $FRONTEND_TAG"
}

# ----------------------------
# Update GitOps repo for Flux
# ----------------------------
update_gitops() {
    log "Updating cluster-config GitOps repo for Flux..."

    # Clone cluster-config if missing
    [ -d ../cluster-config ] || git clone ssh://git@192.168.1.11:222/sarah/cluster-config.git ../cluster-config
    cd ../cluster-config

    # Checkout the correct branch (develop or release)
    git checkout $BASE_BRANCH
    git pull

    # Update deployment YAML with new image tags
    sed -i "s|image: 192.168.1.11:5000/empire-project-backend:.*|image: 192.168.1.11:5000/empire-project-backend:$BACKEND_TAG|g" apps/EmpireCrafting/deployment.yaml
    sed -i "s|image: 192.168.1.11:5000/empire-project-frontend:.*|image: 192.168.1.11:5000/empire-project-frontend:$FRONTEND_TAG|g" apps/EmpireCrafting/deployment.yaml

    # Adjust ingress for develop builds
    if [[ "$BASE_BRANCH" == "develop" ]]; then
        sed -i "s|host: empire.145multimedia.co.uk|host: empire-dev.145multimedia.co.uk|g" apps/EmpireCrafting/deployment.yaml
        # Optional: change service port if needed to avoid collisions
    fi

    git add apps/EmpireCrafting/deployment.yaml
    git commit -m "Update EmpireCrafting images: backend=$BACKEND_TAG, frontend=$FRONTEND_TAG"
    git push origin $BASE_BRANCH

    success "GitOps repo updated successfully. Flux will reconcile automatically."
}

# ----------------------------
# Main script logic
# ----------------------------
ARG="${1:--all}"

case "$ARG" in
    --all)
        build_backend
        build_frontend
        update_gitops
        ;;
    --backend)
        build_backend
        ;;
    --frontend)
        build_frontend
        ;;
    --release)
        build_backend
        build_frontend
        update_gitops
        ;;
    *)
        echo -e "${RED}Usage: $0 [--all|--backend|--frontend|--release]${NC}"
        exit 1
        ;;
esac

success "Deployment finished successfully."

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
