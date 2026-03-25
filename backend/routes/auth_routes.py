"""Authentication routes."""
from flask import Blueprint, request, jsonify
from models.db import get_user_by_username, create_user, user_exists
from utils.auth_utils import (
    hash_password, verify_password,
    generate_token, token_required
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    """Login and get JWT token."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    user = get_user_by_username(username)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not verify_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(
        str(user["id"]),
        user["username"],
        user["role"]
    )

    return jsonify({
        "token": token,
        "user": {
            "id": str(user["id"]),
            "username": user["username"],
            "role": user["role"],
            "full_name": user.get("full_name", "")
        }
    })


@auth_bp.route("/api/auth/register", methods=["POST"])
@token_required
def register(current_user):
    """Register a new user (admin only)."""
    if current_user.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "viewer")
    full_name = data.get("full_name", "")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if user_exists(username):
        return jsonify({"error": "Username already exists"}), 409

    create_user(username, hash_password(password), role, full_name)

    return jsonify({"message": f"User '{username}' created successfully"}), 201


@auth_bp.route("/api/auth/me", methods=["GET"])
@token_required
def get_me(current_user):
    """Get current user info."""
    return jsonify({
        "user": {
            "id": current_user.get("user_id"),
            "username": current_user.get("username"),
            "role": current_user.get("role")
        }
    })
