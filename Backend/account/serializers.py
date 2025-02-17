from rest_framework import serializers
from account.models import Member


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            'id', 'username', 'first_name', 'last_name', 
            'email', 'password', 'birthDate', 'heigt', 'weight',
            'mobileNumber', 'address', 'membershipType', 'sex'
            ]
        extra_kwargs = {'password':{'write_only':True}}

    def create(self, validated_data):
        member = Member(**validated_data)
        member.save()
        return member
