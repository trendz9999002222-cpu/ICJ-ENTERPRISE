from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class ICJTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds user role and email into the JWT payload for frontend role-based routing."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        token["first_name"] = user.first_name
        token["user_id"] = user.id
        token["password_change_required"] = user.password_change_required
        return token
