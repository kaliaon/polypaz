from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    """
    Inline admin for UserProfile to display within User admin
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    fields = (
        'target_language',
        'native_language',
        'current_cefr_level',
        'learning_preferences',
        'created_at',
        'updated_at'
    )
    readonly_fields = ('created_at', 'updated_at')


class CustomUserAdmin(UserAdmin):
    """
    Custom User admin that includes UserProfile inline
    """
    inlines = (UserProfileInline,)
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'get_target_language',
        'get_cefr_level',
        'is_staff'
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__target_language')

    def get_target_language(self, obj):
        """Get target language from profile"""
        if hasattr(obj, 'profile'):
            return obj.profile.get_target_language_display()
        return '-'
    get_target_language.short_description = 'Learning'

    def get_cefr_level(self, obj):
        """Get CEFR level from profile"""
        if hasattr(obj, 'profile'):
            return obj.profile.current_cefr_level
        return '-'
    get_cefr_level.short_description = 'Level'


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for UserProfile model
    """
    list_display = (
        'user',
        'target_language',
        'native_language',
        'current_cefr_level',
        'created_at',
        'updated_at'
    )
    list_filter = ('target_language', 'native_language', 'current_cefr_level', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Language Settings', {
            'fields': ('target_language', 'native_language', 'current_cefr_level')
        }),
        ('Preferences', {
            'fields': ('learning_preferences',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 