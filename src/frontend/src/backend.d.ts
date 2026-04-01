import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_header {
    value: string;
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    countDeletedEntities(): Promise<bigint>;
    countEntities(): Promise<bigint>;
    createEntity(entity: string): Promise<bigint>;
    deleteEntity(id: bigint): Promise<void>;
    extractTextFromImage(_base64ImageData: string, _mimeType: string): Promise<string>;
    fetchCitationFromUrl(_url: string): Promise<string>;
    generateColdEmail(personName: string, personRole: string, personCompany: string, personUrl: string, emailGoal: string, userBackground: string): Promise<string>;
    generateFlashcards(_topic: string, _knowledgeText: string): Promise<string>;
    generateScholarshipEssay(scholarshipName: string, essayPrompt: string, personalBackground: string, personalGoals: string, personalExperiences: string): Promise<string>;
    getAllEntities(): Promise<Array<string>>;
    getEntity(id: bigint): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateEntity(id: bigint, entity: string): Promise<void>;
}
