import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "expo-router";
import { useFonts } from "expo-font";
import NetInfo from '@react-native-community/netinfo';
import { router} from 'expo-router';

export default function Diet() {

   //function to check if the user is online or offline
  const [isConnected, setIsConnected] = useState(null);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Network state changed:", state);
      setIsConnected(state.isConnected);
      setConnectionType(state.type);

      if (state.isConnected === false) {
        router.push('/');
        console.log("Device is offline!");

      } else if (state.isConnected === true) {

        console.log("Device is back online!");

      }
    });

    return () => {
      unsubscribe();
      console.log("NetInfo listener unsubscribed.");
    };
  }, []);

  const getStatusText = () => {
    if (isConnected === null) {
      return "Checking connectivity...";
    } else if (isConnected) {
      return `Online (${connectionType})`;
    } else {
      return "Offline";
    }
  };

  const getStatusColor = () => {
    if (isConnected === null) {
      return 'gray';
    } else if (isConnected) {
      return 'green';
    } else {
      return 'red';
    }
  };
  
  const [weight, setWeight] = useState(null);
  const [height, setHeight] = useState(null);
  const [bmi, setBMI] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [recommendedMeals, setRecommendedMeals] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [fontsLoaded] = useFonts({
    KeaniaOne: require("@/assets/fonts/KeaniaOne-Regular.ttf"),
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const storedWeight = await SecureStore.getItemAsync("weight");
          const storedHeight = await SecureStore.getItemAsync("height");

          if (storedWeight && storedHeight) {
            const parsedWeight = parseFloat(storedWeight);
            const parsedHeight = parseFloat(storedHeight);

            setWeight(parsedWeight);
            setHeight(parsedHeight);

            // Calculate BMI
            if (parsedWeight > 0 && parsedHeight > 0) {
              const heightInMeters = parsedHeight / 100;
              const calculatedBMI =
                parsedWeight / (heightInMeters * heightInMeters);
              setBMI(calculatedBMI);
              setBmiCategory(getBmiClassification(calculatedBMI));
            }
          }
        } catch (error) {
          console.error("Error fetching weight/height:", error);
        }
      };

      fetchData();
    }, [])
  );

  // Fetch meals whenever BMI category changes
  useEffect(() => {
    const fetchRecommendedMeals = async () => {
      if (!bmi || !bmiCategory) return; // Ensure BMI and category are calculated first

      try {
        // Convert height from cm to meters for the API
        const heightInMeters = height / 100;

        const response = await fetch(
          `https://triple-j.onrender.com/api/dietary/meal?height=${heightInMeters.toFixed(
            2
          )}&weight=${weight}&bmi=${bmi.toFixed(
            2
          )}&category=${encodeURIComponent(bmiCategory)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch recommended meals");
        }

        const data = await response.json();
        setRecommendedMeals(data);
      } catch (error) {
        console.error("Error fetching recommended meals:", error);
      }
    };

    fetchRecommendedMeals();
  }, [bmi, bmiCategory, height, weight]);

  // Local BMI classification function
  const getBmiClassification = (bmiValue) => {
    if (bmiValue < 18.5) return "Underweight";
    else if (bmiValue < 25) return "Normal";
    else if (bmiValue < 30) return "Overweight";
    else return "Obese";
  };

  // Get color based on BMI category
  const getBmiColor = (category) => {
    switch (category) {
      case "Underweight":
        return "#FF9800";
      case "Normal":
        return "#4CAF50";
      case "Overweight":
        return "#FF5722";
      case "Obese":
        return "#F44336";
      default:
        return COLORS.accent;
    }
  };

  // Toggle expanded state for meal cards
  const toggleExpand = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* BMI Status Card */}
      <View style={styles.bmiCard}>
        <View style={styles.bmiHeaderRow}>
          <Text style={styles.bmiHeaderText}>Health Status</Text>
          <View
            style={[
              styles.bmiCategoryBadge,
              { backgroundColor: getBmiColor(bmiCategory) },
            ]}
          >
            <Text style={styles.bmiCategoryText}>{bmiCategory || "—"}</Text>
          </View>
        </View>

        <View style={styles.bmiInfoRow}>
          <View style={styles.bmiInfoColumn}>
            <Text style={styles.bmiInfoLabel}>Height</Text>
            <Text style={styles.bmiInfoValue}>
              {height ? `${height} cm` : "—"}
            </Text>
          </View>
          <View style={styles.bmiInfoColumn}>
            <Text style={styles.bmiInfoLabel}>Weight</Text>
            <Text style={styles.bmiInfoValue}>
              {weight ? `${weight} kg` : "—"}
            </Text>
          </View>
          <View style={styles.bmiInfoColumn}>
            <Text style={styles.bmiInfoLabel}>BMI</Text>
            <Text style={styles.bmiInfoValue}>
              {bmi ? bmi.toFixed(1) : "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Recommendation Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended Meals</Text>
        <Text style={styles.sectionSubtitle}>Based on your BMI profile</Text>
      </View>

      {/* Meal Cards */}
      {recommendedMeals.length > 0 ? (
        recommendedMeals.map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mealCard}
            onPress={() => toggleExpand(index)}
            activeOpacity={0.8}
          >
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <View style={styles.goalBadge}>
                <Text style={styles.goalText}>{meal.bodyGoal}</Text>
              </View>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{meal.calorie}</Text>
                <Text style={styles.macroLabel}>calories</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{meal.protein}g</Text>
                <Text style={styles.macroLabel}>protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{meal.carb}g</Text>
                <Text style={styles.macroLabel}>carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{meal.fat}g</Text>
                <Text style={styles.macroLabel}>fat</Text>
              </View>
            </View>

            {expanded === index && (
              <View style={styles.mealDetails}>
                <View style={styles.divider} />
                <Text style={styles.detailsText}>
                  This meal is recommended for your {bmiCategory.toLowerCase()}{" "}
                  BMI profile. It provides a balanced mix of nutrients to
                  support your health goals.
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noMealsCard}>
          <Text style={styles.noMealsText}>
            No meal recommendations available
          </Text>
          <Text style={styles.noMealsSubtext}>
            Check back later or try updating your profile
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const COLORS = {
  background: "#1B1B1D",
  card: "#2C2C34",
  cardLight: "#343440",
  textLight: "#FFF",
  textMedium: "#AAA",
  textDark: "#777",
  accent: "#FF2E63",
  divider: "#3A3A42",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  bmiCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bmiHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bmiHeaderText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontFamily: "KeaniaOne",
  },
  bmiCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  bmiCategoryText: {
    color: COLORS.textLight,
    fontWeight: "bold",
    fontSize: 14,
  },
  bmiInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.cardLight,
    borderRadius: 8,
    padding: 12,
  },
  bmiInfoColumn: {
    flex: 1,
    alignItems: "center",
  },
  bmiInfoLabel: {
    color: COLORS.textMedium,
    fontSize: 12,
    marginBottom: 4,
  },
  bmiInfoValue: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "KeaniaOne",
    color: COLORS.textLight,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: COLORS.textMedium,
    fontSize: 14,
  },
  mealCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealName: {
    fontSize: 16,
    fontFamily: "KeaniaOne",
    color: COLORS.textLight,
    flex: 1,
  },
  goalBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goalText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "bold",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.cardLight,
    borderRadius: 8,
    padding: 12,
  },
  macroItem: {
    alignItems: "center",
  },
  macroValue: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: "bold",
  },
  macroLabel: {
    color: COLORS.textMedium,
    fontSize: 10,
  },
  mealDetails: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 12,
  },
  detailsText: {
    color: COLORS.textMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  noMealsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  noMealsText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontFamily: "KeaniaOne",
    marginBottom: 4,
  },
  noMealsSubtext: {
    color: COLORS.textMedium,
    textAlign: "center",
  },
});
