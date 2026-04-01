import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";



actor {
  include MixinStorage();

  var nextId = 0;
  var deletedCount = 0;
  let entities = Map.empty<Nat, Text>();

  public shared ({ caller }) func createEntity(entity : Text) : async Nat {
    let id = nextId;
    nextId += 1;
    entities.add(id, entity);
    id;
  };

  public shared ({ caller }) func updateEntity(id : Nat, entity : Text) : async () {
    if (not entities.containsKey(id)) { Runtime.trap("No entity with id " # id.toText()) };
    entities.add(id, entity);
  };

  public shared ({ caller }) func deleteEntity(id : Nat) : async () {
    if (not entities.containsKey(id)) { Runtime.trap("No entity with id " # id.toText()) };
    entities.remove(id);
    deletedCount += 1;
  };

  public query ({ caller }) func getEntity(id : Nat) : async Text {
    switch (entities.get(id)) {
      case (null) { Runtime.trap("No entry for entity id " # id.toText()) };
      case (?entity) { entity };
    };
  };

  public query ({ caller }) func getAllEntities() : async [Text] {
    entities.values().toArray();
  };

  public query ({ caller }) func countEntities() : async Nat {
    entities.size();
  };

  public query ({ caller }) func countDeletedEntities() : async Nat {
    deletedCount;
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func generateScholarshipEssay(
    scholarshipName : Text,
    essayPrompt : Text,
    personalBackground : Text,
    personalGoals : Text,
    personalExperiences : Text,
  ) : async Text {
    let apiUrl = "https://api.openai.com/v1/chat/completions";
    let headers = [
      {
        name = "Content-Type";
        value = "application/json";
      },
      {
        name = "Authorization";
        value = "Bearer OPENAI_API_KEY";
      },
    ];

    let systemPrompt = "You are an expert scholarship essay writer who crafts compelling, authentic, and winning scholarship essays. Write in a personal, genuine voice that stands out.";
    let userPrompt = "Essay Prompt: " # essayPrompt # "\n\nScholarship Name: " # scholarshipName # "\nBackground: " # personalBackground # "\nGoals: " # personalGoals # "\nExperiences: " # personalExperiences # "\n\nPlease write a full essay response to the prompt above.";

    let payload = "{
      \"model\": \"gpt-4o-mini\",
      \"max_tokens\": 1500,
      \"temperature\": 0.7,
      \"messages\": [
        { \"role\": \"system\", \"content\": \"" # systemPrompt # "\" },
        { \"role\": \"user\", \"content\": \"" # userPrompt # "\" }
      ]
    }";

    let response = await OutCall.httpPostRequest(apiUrl, headers, payload, transform);
    response;
  };

  public shared ({ caller }) func generateColdEmail(
    personName : Text,
    personRole : Text,
    personCompany : Text,
    personUrl : Text,
    emailGoal : Text,
    userBackground : Text,
  ) : async Text {
    let apiUrl = "https://api.openai.com/v1/chat/completions";
    let headers = [
      {
        name = "Content-Type";
        value = "application/json";
      },
      {
        name = "Authorization";
        value = "Bearer OPENAI_API_KEY";
      },
    ];

    let systemPrompt = "You are an expert at writing highly personalized, effective cold emails that get responses. Research the person's background and craft a message that shows genuine interest and provides clear value.";
    let userPrompt = "Person Name: " # personName # "\nPerson Role: " # personRole # "\nCompany: " # personCompany # "\nLinkedIn/Profile URL: " # personUrl # "\n\nEmail Goal: " # emailGoal # "\nYour Background: " # userBackground # "\n\nPlease generate a highly personalized cold email (subject line + body) targeting the person above. Make it clear that you have researched their background and role. Include specific reasons for the outreach, tailored value propositions, and a strong call-to-action. The tone should be professional, concise, and relevant to the recipient's position and interests.";

    let payload = "{
      \"model\": \"gpt-4o-mini\",
      \"max_tokens\": 1500,
      \"temperature\": 0.7,
      \"messages\": [
        { \"role\": \"system\", \"content\": \"" # systemPrompt # "\" },
        { \"role\": \"user\", \"content\": \"" # userPrompt # "\" }
      ]
    }";

    let response = await OutCall.httpPostRequest(apiUrl, headers, payload, transform);
    response;
  };

  public shared ({ caller }) func extractTextFromImage(
    _base64ImageData : Text,
    _mimeType : Text,
  ) : async Text {
    Runtime.trap("Not implemented - HTTP outcalls with base64 data >2mb require backend-side streaming enhancement.");
  };

  public shared ({ caller }) func fetchCitationFromUrl(_url : Text) : async Text {
    Runtime.trap("Not implemented - HTTP outcalls with large payloads require backend-side streaming enhancement.");
  };

  public shared ({ caller }) func generateFlashcards(_topic : Text, _knowledgeText : Text) : async Text {
    Runtime.trap("Not implemented - HTTP outcalls with large payloads require backend-side streaming enhancement.");
  };
};
