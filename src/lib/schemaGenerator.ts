import { createGenerator } from 'ts-json-schema-generator';
import path from 'path';

const config = {
  path: path.join(process.cwd(), 'src/lib/types.ts'),
  tsconfig: path.join(process.cwd(), 'tsconfig.json'),
  type: '*', // We'll specify the type when calling
};

function resolveSchemaReferences(schema: any, definitions: any): any {
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/definitions/', '');
    return definitions[refPath];
  }
  
  if (schema.type === 'array' && schema.items?.$ref) {
    const refPath = schema.items.$ref.replace('#/definitions/', '');
    return {
      ...schema,
      items: definitions[refPath]
    };
  }
  
  return schema;
}

function convertSchemaToPromptFormat(schema: any, definitions?: any): string {
  console.log('Converting schema to prompt format:', JSON.stringify(schema, null, 2));
  
  // If this is a root schema with $ref, resolve it
  if (schema.$ref && definitions) {
    const refPath = schema.$ref.replace('#/definitions/', '');
    schema = definitions[refPath];
    console.log('Resolved root reference to:', JSON.stringify(schema, null, 2));
  }
  
  if (schema.type === 'object' && schema.properties) {
    console.log('Schema has object type with properties');
    const properties = Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
      console.log(`Processing property: ${key}`, prop);
      let typeStr = '';
      
      // Resolve references if definitions are available
      if (definitions) {
        prop = resolveSchemaReferences(prop, definitions);
      }
      
      if (prop.type === 'string') {
        typeStr = 'string';
      } else if (prop.type === 'number') {
        typeStr = 'number';
      } else if (prop.type === 'integer') {
        typeStr = 'number';
      } else if (prop.type === 'boolean') {
        typeStr = 'boolean';
      } else if (prop.type === 'array') {
        if (prop.items?.type === 'string') {
          typeStr = 'string[]';
        } else if (prop.items?.type === 'object') {
          typeStr = `${convertSchemaToPromptFormat(prop.items, definitions)}[]`;
        } else if (prop.items?.$ref && definitions) {
          const refPath = prop.items.$ref.replace('#/definitions/', '');
          const referencedSchema = definitions[refPath];
          typeStr = `${convertSchemaToPromptFormat(referencedSchema, definitions)}[]`;
        } else {
          typeStr = 'any[]';
        }
      } else if (prop.type === 'object') {
        typeStr = convertSchemaToPromptFormat(prop, definitions);
      } else if (prop.enum) {
        typeStr = prop.enum.map((v: any) => `"${v}"`).join(' | ');
      } else if (prop.$ref && definitions) {
        const refPath = prop.$ref.replace('#/definitions/', '');
        const referencedSchema = definitions[refPath];
        typeStr = convertSchemaToPromptFormat(referencedSchema, definitions);
      } else {
        console.log(`Unknown property type for ${key}:`, prop);
        typeStr = 'any';
      }

      const comment = prop.description ? ` // ${prop.description}` : '';
      const optional = !schema.required?.includes(key) ? '?' : '';
      
      const result = `  "${key}"${optional}: ${typeStr}${comment}`;
      console.log(`Property ${key} formatted as:`, result);
      return result;
    });
    
    const finalResult = `{\n${properties.join(',\n')}\n}`;
    console.log('Final converted schema:', finalResult);
    return finalResult;
  }
  
  console.log('Schema is not an object with properties, returning "any"');
  return 'any';
}

export function generatePersonaJsonStructure(): string {
  console.log('Generating Persona JSON structure...');
  console.log('Config:', config);
  try {
    const generator = createGenerator({ ...config, type: 'Persona' });
    console.log('Generator created successfully for Persona');
    const schema = generator.createSchema('Persona');
    console.log('Persona schema generated:', JSON.stringify(schema, null, 2));
    const result = convertSchemaToPromptFormat(schema, schema.definitions);
    console.log('Persona prompt format result:', result);
    return result;
  } catch (error) {
    console.error('Error generating Persona schema:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return 'any';
  }
}

export function generateCharacterJsonStructure(): string {
  console.log('Generating Character JSON structure...');
  console.log('Config:', config);
  try {
    const generator = createGenerator({ ...config, type: 'Character' });
    console.log('Generator created successfully for Character');
    const schema = generator.createSchema('Character');
    console.log('Character schema generated:', JSON.stringify(schema, null, 2));
    const result = convertSchemaToPromptFormat(schema, schema.definitions);
    console.log('Character prompt format result:', result);
    return result;
  } catch (error) {
    console.error('Error generating Character schema:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return 'any';
  }
}
