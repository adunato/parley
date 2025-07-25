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
  // If this is a root schema with $ref, resolve it
  if (schema.$ref && definitions) {
    const refPath = schema.$ref.replace('#/definitions/', '');
    schema = definitions[refPath];
  }
  
  if (schema.type === 'object' && schema.properties) {
    const properties = Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
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
        typeStr = 'any';
      }

      const comment = prop.description ? ` // ${prop.description}` : '';
      const optional = !schema.required?.includes(key) ? '?' : '';
      
      return `  "${key}"${optional}: ${typeStr}${comment}`;
    });
    
    return `{\n${properties.join(',\n')}\n}`;
  }
  
  return 'any';
}

export function generatePersonaJsonStructure(): string {
  try {
    const generator = createGenerator({ ...config, type: 'Persona' });
    const schema = generator.createSchema('Persona');
    return convertSchemaToPromptFormat(schema, schema.definitions);
  } catch (error) {
    console.error('Error generating Persona schema:', error);
    return 'any';
  }
}

export function generateCharacterJsonStructure(): string {
  try {
    const generator = createGenerator({ ...config, type: 'Character' });
    const schema = generator.createSchema('Character');
    return convertSchemaToPromptFormat(schema, schema.definitions);
  } catch (error) {
    console.error('Error generating Character schema:', error);
    return 'any';
  }
}

export function generateCharacterJsonStructureWithoutRelationships(): string {
  try {
    const generator = createGenerator({ ...config, type: 'Character' });
    const schema = generator.createSchema('Character');
    
    // Remove relationships from the schema
    if (schema.definitions && typeof schema.definitions.Character === 'object' && schema.definitions.Character.properties) {
      delete schema.definitions.Character.properties.relationships;
      // Also remove from required array if present
      if (schema.definitions.Character.required) {
        schema.definitions.Character.required = (schema.definitions.Character.required as string[]).filter((field: string) => field !== 'relationships');
      }
    }
    
    return convertSchemaToPromptFormat(schema, schema.definitions);
  } catch (error) {
    console.error('Error generating Character schema without relationships:', error);
    return 'any';
  }
}
