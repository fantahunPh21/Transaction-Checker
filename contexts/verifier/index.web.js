import { AppRegistry } from 'react-native';
import { createRoot } from 'react-dom/client';
import App from './App';

// Web-specific setup
const rootTag = document.getElementById('root') || document.getElementById('main');

if (rootTag) {
  const root = createRoot(rootTag);
  root.render(<App />);
}

AppRegistry.registerComponent('main', () => App); 