#!/usr/bin/env bash
# Bootstrap a secondary git worktree for local JavaScript development.
#
# Symlinks shared local-only paths from the main checkout (`.zed`, `.docs`, and
# `.env`), then installs dependencies with pnpm. Existing files/directories are
# not overwritten.

set -euo pipefail

log() {
  printf '==> %s\n' "$*"
}

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

warn() {
  printf 'Warning: %s\n' "$*" >&2
}

link_shared_path() {
  local relative_path="$1"
  local source_path="$main_root/$relative_path"
  local target_path="$worktree_root/$relative_path"

  if [[ ! -e "$source_path" ]]; then
    warn "Skipping missing shared path: $source_path"
    return 0
  fi

  if [[ -L "$target_path" ]]; then
    if [[ "$(readlink "$target_path")" == "$source_path" ]]; then
      log "$relative_path already links to main worktree"
      return 0
    fi

    die "$target_path already exists as a symlink to a different target"
  fi

  if [[ -e "$target_path" ]]; then
    die "$target_path already exists; move it aside before running this script"
  fi

  ln -s "$source_path" "$target_path"
  log "Linked $relative_path -> $source_path"
}

command -v git >/dev/null 2>&1 || die "Required command not found: git"
command -v pnpm >/dev/null 2>&1 || die "Required command not found: pnpm"

script_dir="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
worktree_root="$(git -C "$script_dir" rev-parse --show-toplevel)"
worktree_root="$(cd "$worktree_root" && pwd -P)"

# `git worktree list` prints the main worktree first.
main_root="$(git -C "$worktree_root" worktree list --porcelain | sed -n '1s/^worktree //p')"
[[ -n "$main_root" ]] || die "Could not determine the main worktree"
main_root="$(cd "$main_root" && pwd -P)"

[[ "$main_root" != "$worktree_root" ]] || die "This script must be run from a secondary worktree, not the main worktree."

log "Current worktree: $worktree_root"
log "Main worktree: $main_root"

link_shared_path ".zed"
link_shared_path ".docs"
link_shared_path ".env"

log "Installing JavaScript dependencies with pnpm"
(cd "$worktree_root" && pnpm install)

log "Worktree setup complete"
