/**
 * LegalCommunityService — ICJ Enterprise Platform
 * Provides ICJ Enterprise Professional Legal Community Engine,
 * AI Policy Auto-Moderation, and Instant Account Suspension Rules.
 */

const COMMUNITY_POSTS_KEY = "icj_community_posts";
const SUSPENDED_USERS_KEY = "icj_suspended_users";

// Prohibited keywords for AI Policy Auto-Moderation (Profanity, Illegal Solicitation, Hate Speech)
const PROHIBITED_KEYWORDS = [
  "गार्डियन गारंटी केस जीतें 100%", "सस्ता वकील संपर्क करें नकद",
  "cash without receipt", "guaranteed court victory", "100% success fee cash",
  "abuse", "fraud_scam_fake", "illegal_bribe"
];

export const LegalCommunityService = {
  /**
   * Get all community posts
   */
  getPosts() {
    try {
      const raw = localStorage.getItem(COMMUNITY_POSTS_KEY);
      return raw ? JSON.parse(raw) : [
        {
          id: "POST-1001",
          authorName: "Empaneled Senior Advocate",
          authorRole: "advocate",
          barCouncilRegNo: "D/1024/2012 (Bar Council of Delhi)",
          isVerifiedAdvocate: true,
          avatar: "https://static1.lawtribe.com/uploads/users/avatars/b3e9ced3fa215ae86b69eb7ab3cfa253788f411e.png",
          title: "धारा 63 भारतीय साक्ष्य अधिनियम 2023 के तहत डिजिटल दस्तावेज़ों की ग्राह्यता",
          content: "सर्वोच्च न्यायालय द्वारा धारा 63 BSA 2023 (पूर्व धारा 65B) के संदर्भ में महत्वपूर्ण निर्णय दिया गया है। इलेक्ट्रॉनिक साक्ष्य हेतु SHA-256 डिजिटल हैश प्रमाण पत्र आवश्यक है।",
          courtTag: "Supreme Court of India",
          legalStageTag: "Digital Evidence / Sakshya Adhiniyam",
          statuteTags: ["Section 63 BSA 2023", "Sec 65B Evidence Act"],
          upvotesCount: 42,
          isUpvoted: false,
          commentsCount: 5,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "POST-1002",
          authorName: "Pawan Gupta (Community Volunteer)",
          authorRole: "volunteer",
          isVerifiedVolunteer: true,
          avatar: "https://static1.lawtribe.com/uploads/users/avatars/b3e9ced3fa215ae86b69eb7ab3cfa253788f411e.png",
          title: "नागरिक विधिक जागरूकता शिविर - मुफ़्त कानूनी सहायता",
          content: "ट्रस्ट द्वारा आयोजित विधिक सहायता शिविर में कोई भी नागरिक मुफ़्त कानूनी मार्गदर्शन प्राप्त कर सकता है। बार काउंसिल नियमों के अनुसार कोई शुल्क नहीं लिया जाएगा।",
          courtTag: "District Legal Services Authority",
          legalStageTag: "Legal Aid & Awareness",
          statuteTags: ["Legal Services Authorities Act 1987"],
          upvotesCount: 89,
          isUpvoted: true,
          commentsCount: 12,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  },

  /**
   * AI Content Policy Moderation Check
   */
  moderateContent(text) {
    const lower = String(text || "").toLowerCase();
    const violation = PROHIBITED_KEYWORDS.find(word => lower.includes(word.toLowerCase()));
    if (violation) {
      return {
        isViolated: true,
        reason: `AI Policy Violation Detected: Prohibited term or illegal solicitation ("${violation}")`,
      };
    }
    return { isViolated: false, reason: "" };
  },

  /**
   * Check if a user is currently suspended/blocked
   */
  isUserSuspended(userIdOrEmail) {
    try {
      const raw = localStorage.getItem(SUSPENDED_USERS_KEY);
      const suspendedList = raw ? JSON.parse(raw) : [];
      return suspendedList.some(u => String(u.id).toLowerCase() === String(userIdOrEmail).toLowerCase() || String(u.email).toLowerCase() === String(userIdOrEmail).toLowerCase());
    } catch {
      return false;
    }
  },

  /**
   * Suspend a user automatically upon policy violation
   */
  suspendUser(userObj, reason) {
    try {
      const raw = localStorage.getItem(SUSPENDED_USERS_KEY);
      const suspendedList = raw ? JSON.parse(raw) : [];
      const entry = {
        id: userObj.id || userObj.email || "USER-UNK",
        name: userObj.name || userObj.username || "User",
        email: userObj.email || "N/A",
        role: userObj.role || "member",
        reason: reason || "AI Policy Violation & Code of Conduct Breach",
        suspendedAt: new Date().toISOString(),
      };
      suspendedList.push(entry);
      localStorage.setItem(SUSPENDED_USERS_KEY, JSON.stringify(suspendedList));
    } catch {
      // safe fallback
    }
  },

  /**
   * Create a new post with AI Policy Moderation
   */
  createPost(postData, userObj) {
    // 1. Check user suspension
    if (this.isUserSuspended(userObj?.email || userObj?.id)) {
      throw new Error("SUSPENDED_ACCOUNT: आपका खाता नियमों के उल्लंघन के कारण निलंबित कर दिया गया है। पुनः सक्रिय करने हेतु सुपर एडमिन से संपर्क करें।");
    }

    // 2. Run AI Moderation Check
    const modResult = this.moderateContent(`${postData.title} ${postData.content}`);
    if (modResult.isViolated) {
      // Instant Auto-Block User Account & Reject Post
      this.suspendUser(userObj, modResult.reason);
      throw new Error(`POLICY_VIOLATION_BLOCKED: ${modResult.reason}. पोस्ट डिलीट कर दी गई है और आपका खाता ब्लॉक कर दिया गया है।`);
    }

    const posts = this.getPosts();
    const newPost = {
      id: `POST-${Date.now()}`,
      authorName: userObj?.name || userObj?.username || "Legal Member",
      authorRole: userObj?.role || "member",
      barCouncilRegNo: userObj?.barCouncilRegNo || (userObj?.role === "advocate" ? "D/VERIFIED/2026" : ""),
      isVerifiedAdvocate: userObj?.role === "advocate",
      isVerifiedVolunteer: userObj?.role === "volunteer",
      avatar: userObj?.avatar || "https://static1.lawtribe.com/uploads/users/avatars/b3e9ced3fa215ae86b69eb7ab3cfa253788f411e.png",
      title: postData.title || "कानूनी सूचना व विचार",
      content: postData.content || "",
      courtTag: postData.courtTag || "High Court",
      legalStageTag: postData.legalStageTag || "General Legal Discussion",
      statuteTags: postData.statuteTags || [],
      upvotesCount: 0,
      isUpvoted: false,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
    return newPost;
  },

  /**
   * Toggle Upvote on a post
   */
  toggleUpvote(postId) {
    const posts = this.getPosts();
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index].isUpvoted = !posts[index].isUpvoted;
      posts[index].upvotesCount += posts[index].isUpvoted ? 1 : -1;
      localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
      return posts[index];
    }
    return null;
  },
};

export default LegalCommunityService;
