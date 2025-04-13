import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import WebView from 'react-native-webview';
import axios from 'axios';

const CLIENT_ID = 'YOUR_CLIENT_ID';
const REDIRECT_URI = 'myapp://oauth/callback';
const LOGIN_URL = `https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

export default function App() {
  const [token, setToken] = useState(null);
  const [quote, setQuote] = useState(null);
  const [showWebView, setShowWebView] = useState(false);

  const handleNavigationStateChange = async (navState) => {
    const url = navState.url;
    if (url.includes('#access_token=')) {
      const accessToken = url.match(/access_token=([^&]+)/)[1];
      setToken(accessToken);
      setShowWebView(false);

      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const query = `SELECT Id, Name, TotalPrice, Status FROM Quote LIMIT 1`;
        const response = await axios.get(
          `https://yourInstance.salesforce.com/services/data/v59.0/query?q=${encodeURIComponent(query)}`,
          { headers }
        );
        setQuote(response.data.records[0]);
      } catch (error) {
        console.error('Failed to fetch quote:', error.message);
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {!token && !showWebView && (
        <Button title="Login to Salesforce" onPress={() => setShowWebView(true)} />
      )}
      {showWebView && (
        <WebView
          source={{ uri: LOGIN_URL }}
          onNavigationStateChange={handleNavigationStateChange}
        />
      )}
      {quote && (
        <View style={{ marginTop: 20 }}>
          <Text>Quote Name: {quote.Name}</Text>
          <Text>Status: {quote.Status}</Text>
          <Text>Total: ${quote.TotalPrice}</Text>
        </View>
      )}
    </View>
  );
}
