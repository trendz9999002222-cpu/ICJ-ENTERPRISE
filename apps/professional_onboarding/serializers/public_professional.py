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
        raw = obj.profession_field_values or {}
        if not isinstance(raw, dict):
            return {}
        # If flat dict with known keys
        known_keys = {
            "specialisations",
            "practice_areas",
            "bar_council",
            "state_council",
            "qualification",
            "experience_years",
            "experience",
            "enrollment_number",
            "courts",
            "primary_courts",
        }
        if any(k in raw for k in known_keys):
            return raw

        # It's nested: { <prof_id_or_slug>: { ...fields... }, ... }
        merged = {}
        # Prioritize matching the submission's own profession_id
        if obj.profession_id and str(obj.profession_id) in raw:
            p_val = raw[str(obj.profession_id)]
            if isinstance(p_val, dict):
                merged.update(p_val)
        elif obj.profession and obj.profession.slug and obj.profession.slug in raw:
            p_val = raw[obj.profession.slug]
            if isinstance(p_val, dict):
                merged.update(p_val)

        # Merge other profession dicts for any missing values
        for _k, v in raw.items():
            if isinstance(v, dict):
                for subk, subv in v.items():
                    if subk not in merged or not merged[subk]:
                        merged[subk] = subv

        # Also merge city/state from common_field_values if missing
        common = obj.common_field_values or {}
        if isinstance(common, dict):
            for ck in ("state", "city", "email", "mobile", "full_name"):
                if ck not in merged and ck in common:
                    merged[ck] = common[ck]

        return merged

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
        if name and str(name).strip():
            return str(name).strip()
        if obj.user:
            fn = obj.user.get_full_name()
            if fn and fn.strip():
                return fn.strip()
            if obj.user.username:
                return obj.user.username
        return "Verified Practitioner"

    def get_photo_url(self, obj) -> str | None:
        request = self.context.get("request")
        if obj.user_id and obj.user and getattr(obj.user, "profile_picture", None):
            try:
                if obj.user.profile_picture:
                    url = obj.user.profile_picture.url
                    return request.build_absolute_uri(url) if request else url
            except Exception:
                pass
        files = obj.files.all() if hasattr(obj, "files") else []
        for f in files:
            k = (f.document_key or "").lower().strip()
            if (
                k in ("photo", "profile_photo", "passport_photo", "avatar", "photograph", "profile_picture", "profile_image", "user_photo")
                or (f.content_type and f.content_type.startswith("image/") and "photo" in k)
            ):
                try:
                    if f.file:
                        url = f.file.url
                        return request.build_absolute_uri(url) if request else url
                except Exception:
                    pass
        return None

    def get_city(self, obj) -> str:
        common = self._get_common(obj)
        city = common.get("city") or common.get("district")
        if city and str(city).strip():
            return str(city).strip()
        prof = self._get_prof_values(obj)
        nested_city = prof.get("city") or prof.get("practice_city") or prof.get("district")
        if nested_city and str(nested_city).strip():
            return str(nested_city).strip()
        return "New Delhi"

    def get_state(self, obj) -> str:
        common = self._get_common(obj)
        state = common.get("state")
        if state and str(state).strip():
            return str(state).strip()
        prof = self._get_prof_values(obj)
        nested_state = prof.get("state") or prof.get("practice_state")
        if nested_state and str(nested_state).strip():
            return str(nested_state).strip()
        return "Delhi"

    def get_experience(self, obj) -> str:
        prof = self._get_prof_values(obj)
        exp = prof.get("experience_years") or prof.get("experience")
        if exp is not None and str(exp).strip():
            s = str(exp).strip()
            if "year" in s.lower():
                return s
            return f"{s} Years Exp."
        enroll_yr = prof.get("enrollment_year")
        if enroll_yr:
            try:
                import datetime
                yrs = max(1, datetime.date.today().year - int(enroll_yr))
                return f"{yrs} Years Exp."
            except (ValueError, TypeError):
                pass
        return "5+ Years Exp."

    def get_experience_years(self, obj) -> int:
        prof = self._get_prof_values(obj)
        exp_val = prof.get("experience_years") or prof.get("experience")
        if exp_val is not None:
            try:
                import re
                nums = re.findall(r"\d+", str(exp_val))
                if nums:
                    val = int(nums[0])
                    if val > 0:
                        return val
            except (ValueError, TypeError):
                pass
        enroll_yr = prof.get("enrollment_year")
        if enroll_yr:
            try:
                import datetime
                return max(1, datetime.date.today().year - int(enroll_yr))
            except (ValueError, TypeError):
                pass
        return 5

    def get_specialisations(self, obj) -> list[str]:
        prof = self._get_prof_values(obj)
        areas = prof.get("specialisations") or prof.get("practice_areas") or prof.get("specialisation")
        if isinstance(areas, list):
            res = [str(a).strip() for a in areas if a and str(a).strip()]
            if res:
                return res
        if isinstance(areas, str) and areas.strip():
            res = [a.strip() for a in areas.split(",") if a.strip()]
            if res:
                return res
        if obj.profession and obj.profession.name:
            return [obj.profession.name, "Consultation & Advisory"]
        return ["General Practice", "Institutional Advisory"]

    def get_courts(self, obj) -> list[str]:
        prof = self._get_prof_values(obj)
        courts = prof.get("courts") or prof.get("primary_courts") or prof.get("jurisdictions")
        if isinstance(courts, list):
            res = [str(c).strip() for c in courts if c and str(c).strip()]
            if res:
                return res
        if isinstance(courts, str) and courts.strip():
            res = [c.strip() for c in courts.split(",") if c.strip()]
            if res:
                return res
        return ["High Court", "District Courts"]

    def get_languages(self, obj) -> list[str]:
        prof = self._get_prof_values(obj)
        langs = prof.get("languages") or prof.get("languages_spoken")
        if isinstance(langs, list):
            res = [str(l).strip() for l in langs if l and str(l).strip()]
            if res:
                return res
        if isinstance(langs, str) and langs.strip():
            res = [l.strip() for l in langs.split(",") if l.strip()]
            if res:
                return res
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
        return str(prof.get("enrollment_number") or prof.get("bar_number") or prof.get("registration_number") or obj.reference_id)

    def get_bar_council(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("bar_council") or prof.get("state_council") or "")

    def get_firm_name(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("firm_name") or prof.get("chamber_firm_name") or "")

    def get_overview(self, obj) -> str:
        prof = self._get_prof_values(obj)
        if prof.get("overview") or prof.get("bio") or prof.get("about") or prof.get("profile_summary"):
            return str(prof.get("overview") or prof.get("bio") or prof.get("about") or prof.get("profile_summary"))
        name = self.get_full_name(obj)
        prof_name = obj.profession.name if obj.profession else "Practitioner"
        city = self.get_city(obj)
        exp = self.get_experience(obj)
        specs = self.get_specialisations(obj)
        spec_text = f"specializing in {', '.join(specs[:3])}" if specs else "providing expert consultation"
        loc_text = f" based in {city}" if city else ""
        return (
            f"Verified {prof_name}{loc_text} with {exp} of professional standing, {spec_text}."
        )

    def get_consultation_modes(self, obj) -> str:
        prof = self._get_prof_values(obj)
        return str(prof.get("consultation_modes") or "Both (In-person & Virtual)")

    def get_is_verified(self, obj) -> bool:
        return obj.status == ProfessionalRegistrationSubmission.Status.APPROVED

