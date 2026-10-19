// The searchable public-surface index for reference.html.
//
// Every runtime export of `adorn`, `adorn/test` and `adorn/otel` has exactly one entry here, and
// `npm run check` (scripts/check-reference.mjs) fails if an export is missing or an entry names
// something that no longer exists. That keeps the index from drifting from the library.
window.ADORN_REFERENCE = [
  // ---- Installation ----
  { name: 'Contract', module: 'adorn', cat: 'install', sig: '@Contract()', desc: 'Class decorator. Installs enforcement on every contracted method and field, and registers the class for every projection. Required: constraints without it do nothing.' },
  { name: 'Validate', module: 'adorn', cat: 'install', sig: '@Validate()', desc: 'Per-method alternative to @Contract(). Order-sensitive: decorators it should see must sit below it.' },

  // ---- Numeric constraints ----
  { name: 'GreaterThan', module: 'adorn', cat: 'constraint', sig: '@GreaterThan(n)', desc: 'Exclusive lower bound → {exclusiveMinimum: n}.' },
  { name: 'GreaterThanEqual', module: 'adorn', cat: 'constraint', sig: '@GreaterThanEqual(n)', desc: 'Inclusive lower bound → {minimum: n}.' },
  { name: 'LessThan', module: 'adorn', cat: 'constraint', sig: '@LessThan(n)', desc: 'Exclusive upper bound → {exclusiveMaximum: n}.' },
  { name: 'LessThanEqual', module: 'adorn', cat: 'constraint', sig: '@LessThanEqual(n)', desc: 'Inclusive upper bound → {maximum: n}.' },
  { name: 'Between', module: 'adorn', cat: 'constraint', sig: '@Between(min, max)', desc: 'Inclusive range → {minimum, maximum}.' },
  { name: 'Integer', module: 'adorn', cat: 'constraint', sig: '@Integer()', desc: 'A whole number → {type: "integer"}.' },
  { name: 'MultipleOf', module: 'adorn', cat: 'constraint', sig: '@MultipleOf(n)', desc: 'Divisible by n → {multipleOf: n}.' },

  // ---- String constraints ----
  { name: 'StringMinLength', module: 'adorn', cat: 'constraint', sig: '@StringMinLength(n)', desc: 'String-only minimum length → {type: "string", minLength: n}.' },
  { name: 'MinLength', module: 'adorn', cat: 'constraint', sig: '@MinLength(n)', desc: 'Minimum length → {minLength: n}.' },
  { name: 'MaxLength', module: 'adorn', cat: 'constraint', sig: '@MaxLength(n)', desc: 'Maximum length → {maxLength: n}.' },
  { name: 'NotEmpty', module: 'adorn', cat: 'constraint', sig: '@NotEmpty()', desc: 'A non-empty string → {minLength: 1}. Whitespace-only strings count as non-empty.' },
  { name: 'Matches', module: 'adorn', cat: 'constraint', sig: '@Matches(pattern, flags?)', desc: 'Matches a regular expression → {pattern}.' },
  { name: 'Email', module: 'adorn', cat: 'constraint', sig: '@Email()', desc: 'An email address → {type: "string", pattern: …}. Emitted as a pattern rather than format: "email".' },
  { name: 'Url', module: 'adorn', cat: 'constraint', sig: '@Url()', desc: 'A URL → {format: "uri"}.' },
  { name: 'Uuid', module: 'adorn', cat: 'constraint', sig: '@Uuid()', desc: 'A UUID → {format: "uuid"}. The predicate is at least as strict as the format keyword.' },
  { name: 'DateTime', module: 'adorn', cat: 'constraint', sig: '@DateTime()', desc: 'Strict RFC 3339 date-time with real calendar validation (not Date.parse) → {format: "date-time"}.' },
  { name: 'Ipv4', module: 'adorn', cat: 'constraint', sig: '@Ipv4()', desc: 'A dotted-quad IPv4 address → {format: "ipv4"}.' },
  { name: 'Format', module: 'adorn', cat: 'constraint', sig: "@Format('uuid' | 'date-time' | 'ipv4' | …)", desc: 'Keyed alias for the validating string formats.' },

  // ---- Membership & composition ----
  { name: 'OneOf', module: 'adorn', cat: 'constraint', sig: '@OneOf([...values])', desc: 'Strict === membership in a static set → {enum: [...]}. For a per-session set use EnumContracts.OneOf with toolSchemaFrom.' },
  { name: 'Const', module: 'adorn', cat: 'constraint', sig: '@Const(value)', desc: 'Exactly one literal → {const: value}.' },
  { name: 'ArrayOf', module: 'adorn', cat: 'compose', sig: '@ArrayOf(item, {minItems?, maxItems?})', desc: 'A list whose every element satisfies an inner descriptor. Nests, and a failure is localized to the element.' },
  { name: 'Dictionary', module: 'adorn', cat: 'compose', sig: '@Dictionary(value)', desc: 'An open Record<string, V> → {additionalProperties: <value>}. Not expressible in OpenAI strict mode.' },
  { name: 'Shape', module: 'adorn', cat: 'compose', sig: '@Shape(FieldClass)', desc: "A closed DTO validated against another class's @Contract'ed fields. Tightened recursively in tool schemas." },
  { name: 'Nullable', module: 'adorn', cat: 'compose', sig: '@Nullable(item)', desc: 'Widens any constraint to also accept null. Stays required in a tool schema (send a value or explicit null).' },

  // ---- Markers ----
  { name: 'Optional', module: 'adorn', cat: 'marker', sig: '@Optional()', desc: 'An absent (undefined) argument satisfies the position. Dropped from the tool schema\'s required list. Inheritance is required-wins.' },
  { name: 'Default', module: 'adorn', cat: 'marker', sig: '@Default(value)', desc: 'Publishes a JSON default into the schema and implies @Optional. It does not inject the value at runtime.' },
  { name: 'Describe', module: 'adorn', cat: 'marker', sig: "@Describe('…')", desc: "The property's description in schemas and docs. Pure annotation." },
  { name: 'Tool', module: 'adorn', cat: 'marker', sig: "@Tool('…')", desc: 'The method/tool description: the tool schema\'s top-level description.' },
  { name: 'Sensitive', module: 'adorn', cat: 'privacy', sig: '@Sensitive(options?)', desc: 'Marks a field, parameter or class as sensitive. Vetoes value disclosure even under setValueDisclosure("all").' },
  { name: 'Telemetry', module: 'adorn', cat: 'privacy', sig: '@Telemetry.value() | .redact(strategy) | .result()', desc: 'Opts a parameter or the return value into disclosure on the observation path.' },

  // ---- Pre / postconditions ----
  { name: 'Requires', module: 'adorn', cat: 'condition', sig: '@Requires((...args) => boolean, description?)', desc: 'Cross-parameter precondition checked before the call and blamed on the caller. Enforced but not projectable.' },
  { name: 'EnabledWhen', module: 'adorn', cat: 'condition', sig: '@EnabledWhen((self, ...args) => boolean, description?)', desc: 'State-reading enabledness guard that receives the instance. Caller-blamed, never projected, and skipped (not flagged) by fuzzSequence.' },
  { name: 'Ensures', module: 'adorn', cat: 'condition', sig: '@Ensures((result, ...args) => boolean, description?)', desc: 'Closure postcondition on the settled result, blamed on the callee. result is typed unknown, so narrow it.' },
  { name: 'Returns', module: 'adorn', cat: 'condition', sig: '@Returns(descriptor)', desc: 'Reified postcondition: checked like a parameter constraint, and emitted into docs and schema as the return type.' },

  // ---- Method decorators ----
  { name: 'Log', module: 'adorn', cat: 'method', sig: '@Log()', desc: 'Logs each call with safe-by-default redaction.' },
  { name: 'Time', module: 'adorn', cat: 'method', sig: '@Time(options?)', desc: 'Measures duration, including async and Observable-like returns.' },
  { name: 'setTimingSink', module: 'adorn', cat: 'method', sig: 'setTimingSink(sink | null)', desc: 'Routes @Time measurements.' },
  { name: 'Observe', module: 'adorn', cat: 'observe', sig: '@Observe(options?: ObserveOptions)', desc: 'Opens an observation span over the sink, carrying a declared SpanKind.' },

  // ---- Fields ----
  { name: 'Enforce', module: 'adorn', cat: 'field', sig: '@Enforce.greaterThan(0) | .notEmpty() | .oneOf([...]) | …', desc: 'Field decorators that validate on assignment. Inherited: a subclass can strengthen but never weaken.' },
  { name: 'CreateFieldDecorator', module: 'adorn', cat: 'field', sig: 'CreateFieldDecorator(descriptor)', desc: 'Builds a field decorator over any descriptor, including your own.' },
  { name: 'installFieldContracts', module: 'adorn', cat: 'field', sig: 'installFieldContracts(ctor)', desc: 'The imperative field-contract installer.' },

  // ---- Descriptor namespaces ----
  { name: 'NumberContracts', module: 'adorn', cat: 'descriptor', sig: 'NumberContracts.Between(1, 10) | .GreaterThan | .Integer | …', desc: 'Numeric descriptors as plain data, the same ones the decorators record.' },
  { name: 'StringContracts', module: 'adorn', cat: 'descriptor', sig: 'StringContracts.NotEmpty() | .Uuid() | .Matches(re) | …', desc: 'String length, pattern and format descriptors.' },
  { name: 'EnumContracts', module: 'adorn', cat: 'descriptor', sig: 'EnumContracts.OneOf([...]) | .Const(v)', desc: 'Membership descriptors, including runtime enums no decorator could express.' },
  { name: 'ArrayContracts', module: 'adorn', cat: 'descriptor', sig: 'ArrayContracts.ArrayOf(item, opts?)', desc: 'The list descriptor.' },
  { name: 'ObjectContracts', module: 'adorn', cat: 'descriptor', sig: 'ObjectContracts.Fields({...}) | .Shape(Cls) | .Dictionary(v)', desc: 'Object descriptors. Fields is the optional-aware object literal used to validate tool-call arguments.' },
  { name: 'NullableContracts', module: 'adorn', cat: 'descriptor', sig: 'NullableContracts.Nullable(item)', desc: 'The nullable combinator as data.' },
  { name: 'defineConstraint', module: 'adorn', cat: 'descriptor', sig: 'defineConstraint({kind, constraint, derive, describe, schema?, arbitrary?, locate?})', desc: 'Defines a first-class reified constraint that projects and validates exactly like a built-in.' },

  // ---- Working with values ----
  { name: 'Verify', module: 'adorn', cat: 'values', sig: 'Verify.that(d, name, v) | Verify.check(d, name, v)', desc: 'Validates an unknown value. that throws; check returns a CheckResult. Both narrow to the output type, and failures carry path and expected.' },
  { name: 'violationFromCheck', module: 'adorn', cat: 'values', sig: 'violationFromCheck(result, {parameter?})', desc: 'Turns a failed check into ViolationFacts so it can be emitted on the observation stream.' },
  { name: 'contract', module: 'adorn', cat: 'values', sig: 'contract({params, requires, ensures, returns, observe}, fn)', desc: 'The functional twin of @Contract. Wraps a plain function with no class, settles async results, and runs the same oracles.' },
  { name: 'contractSpecOf', module: 'adorn', cat: 'values', sig: 'contractSpecOf(fn)', desc: 'Reads back the spec a contract()-wrapped function carries, for the fuzzer and other tooling.' },

  // ---- Projections ----
  { name: 'toolSchemaForMethod', module: 'adorn', cat: 'projection', sig: "toolSchemaForMethod(Class, 'method', {description?, providerStrict?})", desc: 'The prescriptive LLM tool parameters object: tight required list, additionalProperties: false, optional OpenAI strict mode.' },
  { name: 'toolSchemaFrom', module: 'adorn', cat: 'projection', sig: 'toolSchemaFrom({name?, description?, params}, {providerStrict?})', desc: 'The same tool schema built from named descriptors, for per-session schemas.' },
  { name: 'schemaForClass', module: 'adorn', cat: 'projection', sig: 'schemaForClass(Class)', desc: 'Descriptive JSON Schema (draft 2020-12) of what enforcement accepts. Under-claims rather than over-claims.' },
  { name: 'schemaForContracts', module: 'adorn', cat: 'projection', sig: 'schemaForContracts()', desc: 'Schemas for every contracted class in the registry.' },
  { name: 'serializeSchema', module: 'adorn', cat: 'projection', sig: 'serializeSchema(schema | schemas, options?)', desc: 'Stable JSON serialization of a schema projection.' },
  { name: 'generateSchema', module: 'adorn', cat: 'projection', sig: 'generateSchema(options?)', desc: 'schemaForContracts + serializeSchema in one call. This is what `adorn schema` runs.' },
  { name: 'documentClass', module: 'adorn', cat: 'projection', sig: 'documentClass(Class): ClassDoc', desc: 'The docs model for one class.' },
  { name: 'documentContracts', module: 'adorn', cat: 'projection', sig: 'documentContracts(): ClassDoc[]', desc: 'The docs model for every contracted class.' },
  { name: 'renderMarkdown', module: 'adorn', cat: 'projection', sig: 'renderMarkdown(classes, options?)', desc: 'Renders docs models to Markdown.' },
  { name: 'generateMarkdown', module: 'adorn', cat: 'projection', sig: 'generateMarkdown(options?)', desc: 'documentContracts + renderMarkdown. This is what `adorn docs` runs.' },
  { name: 'telemetryForClass', module: 'adorn', cat: 'projection', sig: 'telemetryForClass(Class): TelemetryReport', desc: 'Privacy review: what each parameter and return of a class is configured to disclose.' },
  { name: 'telemetryForContracts', module: 'adorn', cat: 'projection', sig: 'telemetryForContracts(): TelemetryReport', desc: 'Privacy review across every contracted class.' },
  { name: 'serializeTelemetry', module: 'adorn', cat: 'projection', sig: 'serializeTelemetry(report, options?)', desc: 'Renders a telemetry report, including its scanned denominator.' },
  { name: 'generateTelemetryReport', module: 'adorn', cat: 'projection', sig: 'generateTelemetryReport(options?)', desc: 'telemetryForContracts + serializeTelemetry.' },

  // ---- Configuration ----
  { name: 'setEnforcementMode', module: 'adorn', cat: 'config', sig: "setEnforcementMode('development' | 'production' | 'auto')", desc: 'The enforcement gate. auto follows NODE_ENV. Process-level: set once at startup.' },
  { name: 'setAssertEnforcement', module: 'adorn', cat: 'config', sig: 'setAssertEnforcement(enabled)', desc: 'Turns assert-trust contracts (internal self-checks) on or off.' },
  { name: 'setDefaultTrust', module: 'adorn', cat: 'config', sig: "setDefaultTrust('guard' | 'assert')", desc: 'Default trust for contracts that do not declare one.' },
  { name: 'enableGuardEnforcement', module: 'adorn', cat: 'config', sig: 'enableGuardEnforcement()', desc: 'Re-enables guard contracts.' },
  { name: 'disableGuardEnforcement', module: 'adorn', cat: 'config', sig: 'disableGuardEnforcement({confirm, reason})', desc: 'The only way to strip guard contracts. Requires explicit confirmation and a reason.' },
  { name: 'setViolationPolicy', module: 'adorn', cat: 'config', sig: "setViolationPolicy('throw' | 'warn' | handler)", desc: "What happens on a violation. 'warn' proceeds into the method, for staging a new contract over live traffic." },
  { name: 'setObservationVerbosity', module: 'adorn', cat: 'config', sig: "setObservationVerbosity('normal' | 'detailed')", desc: 'How much the observation path emits.' },
  { name: 'setValueDisclosure', module: 'adorn', cat: 'privacy', sig: "setValueDisclosure('none' | 'all')", desc: "Turns raw values back on in adorn's own emissions for local debugging. @Sensitive still vetoes." },
  { name: 'getValueDisclosure', module: 'adorn', cat: 'privacy', sig: 'getValueDisclosure()', desc: 'Reads the current disclosure setting.' },
  { name: 'setContractDiagnosticsEnabled', module: 'adorn', cat: 'config', sig: 'setContractDiagnosticsEnabled(on)', desc: 'Dev-mode diagnostics, such as the warning for constraints declared without @Contract().' },
  { name: 'setContractDiagnosticsSink', module: 'adorn', cat: 'config', sig: 'setContractDiagnosticsSink(sink | null)', desc: 'Routes diagnostics somewhere other than the console.' },
  { name: 'flushContractDiagnostics', module: 'adorn', cat: 'config', sig: 'flushContractDiagnostics()', desc: 'Emits any pending diagnostics immediately.' },

  // ---- Observability ----
  { name: 'setObservationSink', module: 'adorn', cat: 'observe', sig: 'setObservationSink(sink: ObservationSink)', desc: 'Installs the one around-shaped observation sink.' },
  { name: 'getObservationSink', module: 'adorn', cat: 'observe', sig: 'getObservationSink()', desc: 'The installed sink. Use .record?.(event) to emit without decorators.' },
  { name: 'nextCallId', module: 'adorn', cat: 'observe', sig: 'nextCallId(): number', desc: "The one shared, monotonic correlation-id sequence, so your ids never collide with adorn's." },
  { name: 'RETURN_INDEX', module: 'adorn', cat: 'observe', sig: 'RETURN_INDEX', desc: 'Marks the return value in an EmittedValue.' },
  { name: 'settle', module: 'adorn', cat: 'observe', sig: 'settle(operation, onSettle)', desc: 'The shared classifier for sync, thenable and observable values.' },
  { name: 'consoleObservationSink', module: 'adorn', cat: 'observe', sig: 'consoleObservationSink', desc: 'A ready-made JSON-to-console sink. Opt-in: never installed automatically.' },
  { name: 'createConsoleObservationSink', module: 'adorn', cat: 'observe', sig: 'createConsoleObservationSink(write?)', desc: 'A console sink with a custom line writer.' },

  // ---- Registry introspection ----
  { name: 'getContracts', module: 'adorn', cat: 'registry', sig: 'getContracts(target)', desc: 'Every method contract a class or prototype declares.' },
  { name: 'getContract', module: 'adorn', cat: 'registry', sig: 'getContract(target, key)', desc: 'The contract a method declares.' },
  { name: 'getContractedClasses', module: 'adorn', cat: 'registry', sig: 'getContractedClasses()', desc: 'Every class registered for projection.' },
  { name: 'getContractsForClass', module: 'adorn', cat: 'registry', sig: 'getContractsForClass(Class)', desc: 'Method contracts declared on one class.' },
  { name: 'getFieldContract', module: 'adorn', cat: 'registry', sig: 'getFieldContract(target, field)', desc: 'The contract a field declares.' },
  { name: 'getFieldContracts', module: 'adorn', cat: 'registry', sig: 'getFieldContracts(target)', desc: 'Every field contract a class or prototype declares.' },
  { name: 'getFieldContractsForClass', module: 'adorn', cat: 'registry', sig: 'getFieldContractsForClass(Class)', desc: 'Field contracts declared on one class.' },
  { name: 'getEffectiveContract', module: 'adorn', cat: 'registry', sig: 'getEffectiveContract(target, method)', desc: 'What is in force for a method: the union across the prototype chain.' },
  { name: 'getEffectiveParameterConstraints', module: 'adorn', cat: 'registry', sig: 'getEffectiveParameterConstraints(target, method, index)', desc: 'Effective constraints on one parameter.' },
  { name: 'getEffectiveFieldContract', module: 'adorn', cat: 'registry', sig: 'getEffectiveFieldContract(target, field)', desc: 'What is in force for a field.' },
  { name: 'getEffectiveFieldConstraints', module: 'adorn', cat: 'registry', sig: 'getEffectiveFieldConstraints(target, field)', desc: 'Effective constraints on one field.' },
  { name: 'getEffectivePostconditions', module: 'adorn', cat: 'registry', sig: 'getEffectivePostconditions(target, method)', desc: 'Effective @Returns/@Ensures for a method.' },
  { name: 'getEffectivePreconditions', module: 'adorn', cat: 'registry', sig: 'getEffectivePreconditions(target, method)', desc: 'Effective @Requires for a method.' },
  { name: 'getEffectiveEnablednessGuards', module: 'adorn', cat: 'registry', sig: 'getEffectiveEnablednessGuards(target, method)', desc: 'Effective @EnabledWhen guards for a method.' },

  // ---- Oracles ----
  { name: 'evaluatePreconditions', module: 'adorn', cat: 'oracle', sig: 'evaluatePreconditions(preconditions, args)', desc: 'The same function the runtime wrapper runs for @Requires, so a fuzzer checks exactly what enforcement enforces.' },
  { name: 'evaluatePostconditions', module: 'adorn', cat: 'oracle', sig: 'evaluatePostconditions(postconditions, result, args)', desc: 'The same function the wrapper runs for @Returns/@Ensures.' },
  { name: 'evaluateEnabledness', module: 'adorn', cat: 'oracle', sig: 'evaluateEnabledness(guards, self, args)', desc: 'The same function the wrapper runs for @EnabledWhen, against a live receiver.' },

  // ---- adorn/test ----
  { name: 'fuzzMethod', module: 'adorn/test', cat: 'testing', sig: "fuzzMethod({target, method, subject?, numRuns?, seed?})", desc: 'Property-based test of one method against its own contract.' },
  { name: 'fuzzMethodAsync', module: 'adorn/test', cat: 'testing', sig: "fuzzMethodAsync({target, method, subject?, …})", desc: 'The async variant: postconditions are checked on the settled value.' },
  { name: 'fuzzClass', module: 'adorn/test', cat: 'testing', sig: 'fuzzClass(Class, {subject?, numRuns?, seed?})', desc: 'Fuzzes every contracted method of a class, each in isolation.' },
  { name: 'fuzzClassAsync', module: 'adorn/test', cat: 'testing', sig: 'fuzzClassAsync(Class, options?)', desc: 'The async variant of fuzzClass.' },
  { name: 'fuzzFunction', module: 'adorn/test', cat: 'testing', sig: 'fuzzFunction(contractedFn, options?)', desc: 'Fuzzes a contract()-wrapped function. Arity is inferred.' },
  { name: 'fuzzFunctionAsync', module: 'adorn/test', cat: 'testing', sig: 'fuzzFunctionAsync(contractedFn, options?)', desc: 'The async variant of fuzzFunction.' },
  { name: 'fuzzSequence', module: 'adorn/test', cat: 'testing', sig: 'fuzzSequence(Class, {subject, numRuns?, maxSteps?, seed?})', desc: 'Stateful call-sequence tester: one evolving instance, @EnabledWhen-aware skipping, and invariants re-checked after every step.' },
  { name: 'fuzzSequenceAsync', module: 'adorn/test', cat: 'testing', sig: 'fuzzSequenceAsync(Class, options)', desc: 'The async variant of fuzzSequence.' },
  { name: 'formatFuzzReport', module: 'adorn/test', cat: 'testing', sig: 'formatFuzzReport(result | results, options?)', desc: 'Human-readable report, coverage and limits included.' },
  { name: 'formatSequenceReport', module: 'adorn/test', cat: 'testing', sig: 'formatSequenceReport(result, options?)', desc: 'Human-readable stateful-sequence report.' },
  { name: 'arbitraryForConstraint', module: 'adorn/test', cat: 'testing', sig: 'arbitraryForConstraint(descriptor, depth?)', desc: 'A fast-check arbitrary derived from one descriptor, or an explicit decline.' },
  { name: 'arbitraryForParameter', module: 'adorn/test', cat: 'testing', sig: 'arbitraryForParameter(constraints, index, name?)', desc: "A sound arbitrary for a parameter's whole constraint stack." },
  { name: 'STARVATION_THRESHOLD', module: 'adorn/test', cat: 'testing', sig: 'STARVATION_THRESHOLD', desc: 'The share of rejected generations at which a run reports precondition starvation.' },

  // ---- adorn/otel ----
  { name: 'createOtelSink', module: 'adorn/otel', cat: 'otel', sig: 'createOtelSink(options?)', desc: 'An ObservationSink that maps scope to an active span, completed to a duration histogram, and violation to recordException plus a value-free event.' },
  { name: 'mapSpanKind', module: 'adorn/otel', cat: 'otel', sig: 'mapSpanKind(kind)', desc: "Maps adorn's SpanKind onto OpenTelemetry's." },
  { name: 'attributesFromValues', module: 'adorn/otel', cat: 'otel', sig: 'attributesFromValues(values, prefix?)', desc: 'Turns disclosed EmittedValues into span attributes.' },
  { name: 'violationAttributes', module: 'adorn/otel', cat: 'otel', sig: 'violationAttributes(facts, prefix?)', desc: 'Value-free span attributes for a violation.' },
  { name: 'ADORN_OTEL_VERSION', module: 'adorn/otel', cat: 'otel', sig: 'ADORN_OTEL_VERSION', desc: 'The instrumentation-scope version reported to OpenTelemetry.' },
];

window.ADORN_REFERENCE_CATEGORIES = {
  install: 'Installation',
  constraint: 'Parameter constraints',
  compose: 'Composition',
  marker: 'Markers',
  condition: 'Pre/postconditions',
  field: 'Fields',
  method: 'Method decorators',
  descriptor: 'Descriptors',
  values: 'Working with values',
  projection: 'Projections',
  config: 'Configuration',
  privacy: 'Privacy',
  observe: 'Observability',
  registry: 'Registry',
  oracle: 'Oracles',
  testing: 'adorn/test',
  otel: 'adorn/otel',
};
