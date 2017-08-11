import initializeComponent from './initializeComponent.js';
const ractive = window.Ractive;
const buildComponent = (componentConfig) => {
  initializeComponent(componentConfig);
  const {
    name: componentName,
    model: componentModel,
  } = componentConfig;
  const createdComponent = ractive.extend(componentConfig);
  if (componentName) {
    ractive.components[componentName] = createdComponent;
  }
  if (componentModel) {
    componentModel.component = createdComponent;
  }
  return createdComponent;
};
export default buildComponent;
