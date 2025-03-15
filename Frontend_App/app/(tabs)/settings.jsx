import { Image, StyleSheet, Platform, View, Text, Linking, TouchableOpacity,TextInput} from 'react-native';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import colors from '../../constants/globalStyles';
import * as SecureStore from 'expo-secure-store';
import { router, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';


//deletes the tokens for authentication and redirects to login page
 async function logoutDetails() {
  try {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("username");
    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("weight");
    await SecureStore.deleteItemAsync("height");
    await SecureStore.deleteItemAsync("password");
    await SecureStore.deleteItemAsync("membershipType");

    console.log(`Item with key  access: '${"accessToken"}' has been deleted.`);
    console.log(`Item with key  refresh: '${"refreshToken"}' has been deleted.`);
    console.log(`Item with key  username: '${"username"}' has been deleted.`);
    console.log(`Item with key  userID: '${"userID"}' has been deleted.`);
    console.log(`Item with key  weight: '${"weight"}' has been deleted.`);
    console.log(`Item with key  height: '${"height"}' has been deleted.`);
    console.log(`Item with key  password: '${"password"}' has been deleted.`);
    console.log(`Item with key  membershipType: '${"membershipType"}' has been deleted.`);

    router.push('/');
    
  } catch (error) {
    console.error('Error deleting item:', error);
  }
}



export default function Settings() {

  const [memberInfo, setMemberInfo] = useState([]);
  const [membershipInfo, setMembershipInfo] = useState([]);
  const [memberHeight, setMemberHeight] = useState('');
  const [memberWeight, setMemberWeight] = useState('');

  const [fontsLoaded] = useFonts({
    KeaniaOne: require('@/assets/fonts/KeaniaOne-Regular.ttf'),
  });

  async function startPayment() {
    try {
      let accessToken = await SecureStore.getItemAsync("accessToken");
      let refreshToken = await SecureStore.getItemAsync("refreshToken");
      let username = await SecureStore.getItemAsync("username");
      
      console.log("access: " + accessToken);
      console.log("refresh: " + refreshToken);
      console.log("username: " + username);
  
      let response = await fetch(`https://triple-j.onrender.com/api/account/membership/subscription`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
  
      if (response.status === 401) {
        console.log("Access token expired");
        accessToken = await refreshAccessToken();
        console.log("New access token: " + accessToken);
        if (!accessToken) {
          throw new Error("Failed to refresh access token");
        }
        
        response = await fetch(`https://triple-j.onrender.com/api/account/membership/subscription`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
      }
  
        const data = await response.json();
        console.log(data.details.link);
        Linking.openURL(data.details.link).catch(err => console.error('An error occurred', err));
      } catch (error) {
        console.error("Error:", error);
      }
  
  }

  
  //function to retrieve member information such as name, membership type, and expiry of membership
async function getMemberInfo() {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let username = await SecureStore.getItemAsync("username");
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);
    console.log("username: " + username);

    let response = await fetch(`https://triple-j.onrender.com/api/account/member/${username}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(`https://triple-j.onrender.com/api/account/member/${username}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }

      const data = await response.json();
      setMemberInfo(data);
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }

}

//function to update height and weight of member
async function setMemberHW(newHeight,newWeight) {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let username = await SecureStore.getItemAsync("username");
    let membershipType = memberInfo.membershipType;
    
    console.log("access: " + accessToken);
    console.log("refresh: " + refreshToken);
    console.log("username: " + username);

    let response = await fetch(`https://triple-j.onrender.com/api/account/member/${username}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        'height':newHeight,
        'weight':newWeight,
        'username': username,
        'membershipType':membershipType,
      }),
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch(`https://triple-j.onrender.com/api/account/member/${username}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          'height':newHeight,
          'weight':newWeight,
          'username': username,
          'membershipType':membershipType,
        }),
      });
    }

      const data = await response.json();
      console.log(data);
      await SecureStore.setItemAsync("weight",data.weight.toString());
      await SecureStore.setItemAsync("height",data.height.toString());
      getMemberInfo();
    } catch (error) {
      console.error("Error:", error);
    }

}


async function getMembershipInfo() {
  try {
    let accessToken = await SecureStore.getItemAsync("accessToken");
    let refreshToken = await SecureStore.getItemAsync("refreshToken");
    let username = await SecureStore.getItemAsync("username");

    let response = await fetch("https://triple-j.onrender.com/api/account/membership", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      console.log("Access token expired");
      accessToken = await refreshAccessToken();
      console.log("New access token: " + accessToken);
      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }
      
      response = await fetch("https://triple-j.onrender.com/api/account/membership", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
    }
      const data = await response.json(); 
      setMembershipInfo(data);
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }

}

useEffect(() => {
  getMemberInfo();
  getMembershipInfo();
}, []);


function calculateExpiry(startDate, membershipType) {
  if (!startDate) return "Unknown"; 

  const start = new Date(startDate);
  const end = new Date(start);

  if (membershipType === "Monthly") {
    end.setDate(start.getDate() + 30);
  }

  return end.toISOString().split("T")[0];
}

 return(

  <ScrollView>

    <View style={styles.container}>
      

        <View style={styles.accountCont}>
          
          <View style={styles.headerCont}>
            <FontAwesome6 name="user" size={24} color="white" />
            <Text style={styles.titleText}>Account Info</Text>
          </View>


          <View>
            <Text style={styles.subText}>
            Account Holder: {memberInfo.first_name} 
            </Text>
            <Text style={styles.subText}>
            Membership Type: {memberInfo.membershipType}
            </Text>
            <Text style={styles.subText}>
            Height: {memberInfo.height} cm
            </Text>
            <Text style={styles.subText}>
            Weight: {memberInfo.weight} kg
            </Text>
            <Text  style={styles.subText}>
            Membership Expiry: {calculateExpiry(membershipInfo.startDate, memberInfo.membershipType)}
            </Text>
            
          </View>

        </View>

      <View style={styles.accountCont}>

          <View style={styles.headerCont}>
            <FontAwesome6 name="user" size={24} color="white" />
            <Text style={styles.titleText}>Update Biometrics</Text>
          </View>

          <View  style={{marginBottom: 20}}>
                  <Text style={styles.inputFieldText}>
                    Height (cm)
                  </Text>
                  <TextInput  onChangeText={newText => {setMemberHeight(newText)}} cursorColor={colors.redAccent} style={styles.inputField} />
          </View>
          <View  style={{marginBottom: 20}}>
                  <Text style={styles.inputFieldText}>
                    Weight (kg)
                  </Text>
                  <TextInput  onChangeText={newText => setMemberWeight(newText)} cursorColor={colors.redAccent} style={styles.inputField} />
          </View>

          <TouchableOpacity onPress={async ()=>{
            await setMemberHW(memberHeight,memberWeight);
          }}  style={styles.loginBtn}>
                  <Text style={styles.loginBtnTxt}>
                    Update
                  </Text>
          </TouchableOpacity>

      </View>
      

      <View style={styles.contactCont}>
        
        <View style={styles.headerCont}>
          <FontAwesome6 name="envelope" size={24} color="white" />
          <Text style={styles.titleText}>Contact & Business Info</Text>
        </View>


        <View>
          <Text style={styles.subText}>
          Contact no. 0917 622 9969 
          </Text>

          <Text style={styles.subText}>
          Facebook: <Text onPress={() => Linking.openURL('https://www.facebook.com/triplejfitnesscenter')} > facebook.com/triplejfitnesscenter </Text>
          </Text>

          <Text  style={styles.subText}>
          Address: 34 Lj Building unit 5 4th floor illenado compound maysan road malina, Valenzuela, Philippines
          </Text>

        </View>



      </View>

      <TouchableOpacity onPress={async ()=>{
        await startPayment();
        console.log("redirected to payment channel");
      }}>

        <View style={styles.membershipCont}>
          
            <FontAwesome6 name="credit-card" size={24} color="white" />
            <Text style={[styles.titleText, {fontSize: 20}]} >
              Membership Payment</Text>
          
        </View>

      </TouchableOpacity>

      <TouchableOpacity onPress={() => {logoutDetails()}}>

        <View style={styles.logoutCont}>
          
            <FontAwesome6 name="right-from-bracket" size={24} color="white" />
            <Text style={[styles.titleText, {fontSize: 20}]} >
              Logout</Text>
          
        </View>

      </TouchableOpacity>

    </View>
  </ScrollView>




 )
}

const styles = StyleSheet.create({
  container:{
      backgroundColor: colors.primaryBackground,
      flex: 1,
      padding: 20,
     },
  subText: {
    color: 'white',
    fontFamily: 'KeaniaOne',
    marginBottom: 5,
  },
  titleText:{
    color: 'white',
    marginLeft: 10,
    fontFamily: 'KeaniaOne',
  },
  headerCont:{
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    paddingBottom: 8,
    marginBottom: 10
  },
  accountCont:{
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  contactCont:{
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  membershipCont:{
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutCont:{
    backgroundColor: '#1E1F26',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFieldText:{
      color: colors.redAccent,
      left: 20,
      fontFamily: 'KeaniaOne',
      marginBottom: 8,
   },
   inputField:{
    backgroundColor: '#5E5C5C',
    borderRadius: 22,
    height: 50,
    color: 'white',
    paddingLeft: 20,
    paddingRight: 20,
   },
   loginBtn:{
    backgroundColor: '#4259CA',
    padding: 15,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 15,
},
 loginBtnTxt:{
    fontFamily: 'KeaniaOne',
    color: 'white',
    fontSize: 14,
},
});