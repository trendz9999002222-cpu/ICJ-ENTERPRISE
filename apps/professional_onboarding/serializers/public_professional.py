from rest_framework import serializers

from apps.professional_onboarding.models import ProfessionalRegistrationSubmission


def _mask_name(name: str) -> str:
    if not name:
        return ""
    return name


class PublicProfessionalProfileSerializer(serializers.ModelSerializer):
    """
    Public directory profile serializer for approved professional submissions.
    """

    full_name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_id = serializers.CharField(source="category.id", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    group_name = serializers.CharField(source="group.name", read_only=True)
    group_id = serializers.CharField(source="group.id", read_only=True)
    group_slug = serializers.CharField(source="group.slug", read_only=True)
    profession_name = serializers.CharField(source="profession.name", read_only=True)
    profession_id = serializers.CharField(source="profession.id", read_only=True)
    profession_slug = serializers.CharField(source="profession.slug", read_only=True)

    registered_categories = serializers.SerializerMethodField()
    registered_professions = serializers.SerializerMethodField()

    city = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    experience = serializers.SerializerMethodField()
    experience_years = serializers.SerializerMethodField()
    specialisations = serializers.SerializerMethodField()
    courts = serializers.SerializerMethodField()
    languages = serializers.SerializerMethodField()
    qualification = serializers.SerializerMethodField()
    university = serializers.SerializerMethodField()
    passing_year = serializers.SerializerMethodField()
    enrollment_number = serializers.SerializerMethodField()
    bar_council = serializers.SerializerMethodField()
    firm_name = serializers.SerializerMethodField()
    overview = serializers.SerializerMethodField()
    consultation_modes = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalRegistrationSubmission
        fields = (
            "id",
            "reference_id",
            "full_name",
            "photo_url",
            "category_name",
            "category_id",
            "category_slug",
            "group_name",
            "group_id",
            "group_slug",
            "profession_name",
            "profession_id",
            "profession_slug",
            "registered_categories",
            "registered_professions",
            "city",
            "state",
            "experience",
            "experience_years",
            "specialisations",
            "courts",
            "languages",
            "qualification",
            "university",
            "passing_year",
            "enrollment_number",
            "bar_council",
            "firm_name",
            "overview",
            "consultation_modes",
            "is_verified",
            "created_at",
        )

    def _get_common(self, obj) -> dict:
        return obj.common_field_values or {}

    def _get_prof_values(self, obj) -> dict:
        return obj.profession_field_values or {}

    def get_registered_categories(self, obj) -> list[str]:
        from apps.professional_onboarding.models import Category
        ids = obj.selected_category_ids or []
        if not ids and obj.category_id:
            ids = [str(obj.category_id)]
        try:
            return list(Category.objects.filter(id__in=ids).values_list('name', flat=True))
        except Exception:
            return [obj.category.name] if obj.category else []

    def get_registered_professions(self, obj) -> list[str]:
        from apps.professional_onboarding.models import Profession
        ids = obj.selected_profession_ids or []
        if not ids and obj.profession_id:
            ids = [str(obj.profession_id)]
        try:
            return list(Profession.objects.filter(id__in=ids).values_list('name', flat=True))
        except Exception:
            return [obj.profession.name] if obj.profession else []

    def get_full_name(self, obj) -> str:
        common = self._get_common(obj)
        name = common.get("full_name") or common.get("name") or common.get("applicant_name")
        if name:
            return str(name)
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return "Verified Practitioner"

    def get_photo_url(self, obj) -> str | None:
        request = self.context.get("request")
        for f in obj.files.all():
            if f.document_key in ("photo", "profile_photo", "passport_photo", "avatar") and f.file:
                url = f.file.url
                if request:
                    return request.build_absolute_uri(url)
                return url
        return None

    def get_city(self, obj) -> str:
        common = self._get_common(obj)
        # Check flat common fields first
        city = common.get("city") or common.get("district")
        if city:
            return str(city)
        # Check nested profession_field_values: {uuid: {city: ..., ...}}
        prof = obj.profession_field_values or {}
        for _k, v in prof.items():
            if isinstance(v, dict):
                c = v.get("city") or v.get("practice_city")
                if c:
                    return str(c)
        return ""

    def get_state(self, obj) -> str:
        common = self._get_common(obj)
        # Check flat common fields first
        state = common.get("state")
        if state:
            return str(state)
        # Check nested profession_field_values
        prof = obj.profession_field_values or {}
        for _k, v in prof.items():
            if isinstance(v, dict):
                st = v.get("state") or v.get("practice_state")
                if st:
                    return str(st)
        return ""

    def get_experience(self, obj) -> str:
        prof = obj.profession_field_values or {}
        # Nested structure: {prof_uuid: {enrollment_year, experience, ...}}
        for _k, v in prof.items():
            if not isinstance(v, dict):
                continue
            exp = v.get("experience") or v.get("experience_years")
            if exp:
                return str(exp)
            enroll_yr = v.get("enrollment_year")
            if enroll_yr:
                try:
                    import datetime
                    yrs = max(1, datetime.date.today().year - int(enroll_yr))
                    return f"{yrs} Years Exp."
                except (ValueError, TypeError):
                    pass
        return "Experienced"

    def get_experience_years(self, obj) -> int:
        prof = obj.profession_field_values or {}
        import datetime
        current_year = datetime.date.today().year
        for _k, v in prof.items():
            if not isinstance(v, dict):
                continue
            enroll_yr = v.get("enrollment_year")
            if enroll_yr:
                try:
                    return max(1, current_year - int(enroll_yr))
                except (ValueError, TypeError):
                    pass
            exp = str(v.get("experience") or "")
            if "10+" in exp or "15+" in exp:
                return 15
            if "5-10" in exp or "5" in exp:
                return 7
            if "3-5" in exp or "3" in exp:
                return 4
            if "1-3" in exp or "2" in exp:
                return 2
        return 5

    def get_specialisations(self, obj) -> list[str]:
        prof = self._get_prof_values(obj)
        areas = prof.get("practice_areas") or prof.get("specialisations") or prof.get("specialisation")
        if isinstance(areas, list):
            return [str(a) for a in areas if a]
        if isinstance(areas, str) and areas:
            return [a.strip() for a in areas.split(",") if a.strip()]
        return ["General Practice", "Institutional Advisory"]

    def get_courts(self, obj) -> list[str]:
        prof = self._get_prof_values(obj)
        courts = prof.get("courts") or prof.get("jurisdictions")
        if isinstance(courts, list):
            return [str(c) for c in courts if c]
        if isinstance(courts, str) and courts:
            return [c.strip() for c in courts.split(",") if c.strip()]
        return ["High Court", "District Courts"]

    def get_languages(self, obj) -> list[str]:
        prof = self._get_prof_values(obj)
        langs = prof.get("languages") or prof.get("languages_spoken")
        if isinstance(langs, list):
            return [str(l) for l in langs if l]
        if isinstance(langs, str) and langs:
            return [l.strip() for l in langs.split(",") if l.strip()]
        return ["English", "Hindi"]

    def get_qualification(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("qualification") or prof.get("degrees") or "Graduate Professional")

    def get_university(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("university") or "")

    def get_passing_year(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("passing_year") or "")

    def get_enrollment_number(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("enrollment_number") or prof.get("bar_number") or obj.reference_id)

    def get_bar_council(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("bar_council") or "")

    def get_firm_name(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("firm_name") or "")

    def get_overview(self, obj) -> str:
        prof = self._get_prof_values(obj)
        if prof.get("overview") or prof.get("bio") or prof.get("about"):
            return str(prof.get("overview") or prof.get("bio") or prof.get("about"))
        name = self.get_full_name(obj)
        prof_name = obj.profession.name if obj.profession else "Practitioner"
        city = self.get_city(obj)
        exp = self.get_experience(obj)
        return (
            f"Verified {prof_name} based in {city} with {exp} of professional standing, "
            f"specializing in {', '.join(self.get_specialisations(obj)[:3])}."
        )

    def get_consultation_modes(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("consultation_modes") or "Both (In-person & Virtual)")

    def get_is_verified(self, obj) -> bool:
        return obj.status == ProfessionalRegistrationSubmission.Status.APPROVED
