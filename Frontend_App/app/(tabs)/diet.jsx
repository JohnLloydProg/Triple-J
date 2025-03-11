import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "expo-router";
import { useFonts } from "expo-font";

export default function Diet() {
  const [weight, setWeight] = useState(null);
  const [height, setHeight] = useState(null);
  const [bmi, setBMI] = useState(null);
  const [bmiCategory, setBmiCategory] = useState("");
  const [recommendedMeals, setRecommendedMeals] = useState([]);

  const [fontsLoaded] = useFonts({
    KeaniaOne: require("@/assets/fonts/KeaniaOne-Regular.ttf"),
  });

  // Fetch weight & height from SecureStore and then get recommended meals from the server
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const storedWeight = await SecureStore.getItemAsync("weight");
          const storedHeight = await SecureStore.getItemAsync("height");

          const parsedWeight = parseFloat(storedWeight);
          const parsedHeight = parseFloat(storedHeight);

          setWeight(parsedWeight);
          setHeight(parsedHeight);

          if (parsedWeight && parsedHeight) {
            // 1) Calculate BMI and classification
            const heightInMeters = parsedHeight / 100;
            const calculatedBMI =
              parsedWeight / (heightInMeters * heightInMeters);
            setBMI(calculatedBMI);
            setBmiCategory(getBmiClassification(calculatedBMI));

            // 2) Fetch recommended meals from your server
            // Adjust the base URL as needed
            const response = await fetch(
              `https://triple-j.onrender.com/api/dietary/meal?height=${parsedHeight}&weight=${parsedWeight}`
            );
            if (!response.ok) {
              throw new Error("Failed to fetch recommended meals");
            }

            const data = await response.json();
            console.log(data);
            setRecommendedMeals(data);
          }
        } catch (error) {
          console.error("Error fetching data or recommended meals:", error);
        }
      };

      fetchData();
    }, [])
  );

  // Local BMI classification
  const getBmiClassification = (bmiValue) => {
    if (bmiValue < 18.5) return "Underweight";
    else if (bmiValue < 25) return "Normal";
    else if (bmiValue < 30) return "Overweight";
    else return "Obese";
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Box: Height/Weight and BMI Result */}
      <View style={styles.topBox}>
        {/* Left side: Height & Weight (read-only) */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.textInput}
            editable={false}
            value={height ? height.toString() : ""}
            placeholder="0"
            placeholderTextColor="#888"
          />
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.textInput}
            editable={false}
            value={weight ? weight.toString() : ""}
            placeholder="0"
            placeholderTextColor="#888"
          />
        </View>

        {/* Right side: BMI classification */}
        <View style={styles.bmiBox}>
          <Text style={styles.bmiCategory}>
            {bmiCategory ? bmiCategory : "—"}
          </Text>
          <Text style={styles.bmiValue}>
            {bmi ? `BMI: ${bmi.toFixed(2)}` : "No BMI yet"}
          </Text>
        </View>
      </View>

      {/* Recommended Meals */}
      <Text style={styles.mealSectionTitle}>Recommended Meals</Text>
      {recommendedMeals.map((meal, index) => (
        <View key={index} style={styles.mealCard}>
          <Image source={{ uri: meal.image }} style={styles.mealImage} />
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.name}</Text>

            <Text style={styles.mealDetailLine}>
              <Text style={styles.label}>BodyGoal:</Text>
              <Text style={styles.value}> {meal.bodyGoal}</Text>
            </Text>

            <Text style={styles.mealDetailLine}>
              <Text style={styles.label}>Calories:</Text>
              <Text style={styles.value}> {meal.calorie}</Text>
            </Text>

            <Text style={styles.mealDetailLine}>
              <Text style={styles.label}>Protein:</Text>
              <Text style={styles.value}> {meal.protein}g</Text>
            </Text>

            <Text style={styles.mealDetailLine}>
              <Text style={styles.label}>Carbs:</Text>
              <Text style={styles.value}> {meal.carb}g</Text>
            </Text>

            <Text style={styles.mealDetailLine}>
              <Text style={styles.label}>Fat:</Text>
              <Text style={styles.value}> {meal.fat}g</Text>
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const COLORS = {
  background: "#1B1B1D",
  card: "#2C2C34",
  textLight: "#FFF",
  textMedium: "#AAA",
  accent: "#FF2E63",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  topBox: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  inputBox: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    color: "red",
    fontFamily: "KeaniaOne",
  },
  textInput: {
    backgroundColor: "#3A3A42",
    color: COLORS.textLight,
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  bmiBox: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#3A3A42",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bmiCategory: {
    color: COLORS.textLight,
    fontSize: 18,
    fontFamily: "KeaniaOne",
    marginBottom: 4,
  },
  bmiValue: {
    color: COLORS.textMedium,
  },
  mealSectionTitle: {
    fontSize: 20,
    fontFamily: "KeaniaOne",
    color: COLORS.textLight,
    marginBottom: 12,
  },
  mealCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  mealImage: {
    width: 100,
    height: 100,
  },
  mealInfo: {
    flex: 1,
    padding: 8,
    justifyContent: "center",
  },
  mealName: {
    color: "white",
    fontFamily: "KeaniaOne",
    fontSize: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  mealDetailLine: {
    marginBottom: 4,
    fontFamily: "KeaniaOne",
  },
  bodyGoalDetail: {
    color: "white",
    fontSize: 14,
    fontFamily: "KeaniaOne",
  },
  value: {
    color: "grey",
  },
});
