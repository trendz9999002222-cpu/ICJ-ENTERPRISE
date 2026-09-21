from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import models


class ServiceError(Exception):
    def __init__(self, message: str, errors: dict | None = None):
        self.message = message
        self.errors = errors or {}
        super().__init__(message)


def save_instance(instance: models.Model) -> models.Model:
    try:
        instance.full_clean()
    except DjangoValidationError as exc:
        raise ServiceError("Validation failed.", exc.message_dict if hasattr(exc, "message_dict") else {"detail": exc.messages})
    instance.save()
    return instance


def create_model(model_cls: type[models.Model], validated_data: dict) -> models.Model:
    return save_instance(model_cls(**validated_data))


def update_model(instance: models.Model, validated_data: dict) -> models.Model:
    for key, value in validated_data.items():
        setattr(instance, key, value)
    return save_instance(instance)
