from rest_framework import serializers
from account.models import Member, DailyMembership, MonthlyMembership


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            'id', 'username', 'first_name', 'last_name', 
            'email', 'birthDate', 'height', 'weight',
            'mobileNumber', 'address', 'gymTrainer','membershipType', 'sex', 
            'profilePic'
            ]

    def create(self, validated_data):
        member = Member(**validated_data)
        member.save()
        return member


class DailyMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMembership
        fields = ['startDate', 'member', 'price']
        extra_kwargs = {
            'startDate':{'read_only':True},
            'member':{'read_only':True},
            'price':{'read_only':True}
            }


class MonthlyMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyMembership
        fields = ['startDate', 'member', 'price', 'expirationDate']
        extra_kwargs = {
            'startDate':{'read_only':True},
            'member':{'read_only':True},
            'price':{'read_only':True},
            'expirationDate':{'read_only':True}
            }
