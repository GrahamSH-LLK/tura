# name: tura
# about: abbreviations for Discourse posts
# version: 0.0.1
# authors: GrahamSH
# url: https://github.com/grahamsh-llk/tura

enabled_site_setting :discourse_tura_enabled
register_asset "stylesheets/tooltips.scss"

DiscoursePluginRegistry.serialized_current_user_fields << "see_abbreviations"

after_initialize do
    User.register_custom_field_type("see_abbreviations", :boolean)
    add_to_class(:user, :see_abbreviations) do
        if custom_fields["see_abbreviations"] != nil
            custom_fields["see_abbreviations"]
        else
            true
        end
    end
    add_to_serializer(:user, :see_abbreviations) { object.see_abbreviations }
    register_editable_user_custom_field :see_abbreviations
end

