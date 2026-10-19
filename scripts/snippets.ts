// Generates the "derived artifact" outputs shown on the homepage from the REAL library, so the site
// never displays a hand-written schema that could drift from what adorn actually emits.
//
//   npm run snippets   (runs ../adorn's ts-node against ../adorn/dist; writes
//   public/assets/snippets.json)
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
    Contract, Tool, Describe, NotEmpty, OneOf, GreaterThanEqual, LessThanEqual,
    toolSchemaForMethod, documentClass, renderMarkdown, telemetryForClass, serializeTelemetry,
    setContractDiagnosticsEnabled,
} from '../../adorn/dist/index';

setContractDiagnosticsEnabled(false);

@Contract()
class WeatherTool {
    @Tool('Look up a weather forecast.')
    getWeather(
        @Describe('the city to look up') @NotEmpty() location: string,
        @OneOf(['celsius', 'fahrenheit']) unit: string,
        @GreaterThanEqual(1) @LessThanEqual(7) days: number,
    ): string {
        return `${location} ${unit} ${days}`;
    }
}

let violation = '';
try {
    new WeatherTool().getWeather('Lisbon', 'celsius', 99);
} catch (e) {
    violation = (e as Error).message;
}

const out = {
    toolSchema: JSON.stringify(toolSchemaForMethod(WeatherTool, 'getWeather'), null, 2),
    violation,
    markdown: renderMarkdown([documentClass(WeatherTool)]),
    telemetry: serializeTelemetry(telemetryForClass(WeatherTool)),
};
writeFileSync(resolve(__dirname, '../public/assets/snippets.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2));
