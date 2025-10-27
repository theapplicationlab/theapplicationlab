---
title: Getting Involved
description: Join our growing community as a mentor, mentee, or volunteer, and help make higher education more accessible for everyone.
draft: false
sections:
  - title: "Become a Mentor"
    url: "https://forms.office.com/r/CDaYdmMbz3"
    icon: "fas fa-person-chalkboard"
    description: "**Whether you are a current student or a recent graduate from a leading global university, your experience can make a difference.** Join us as a mentor to guide and empower the next generation of applicants."
    key_areas:
      - "**Application Strategy:** Guide mentees on building a strong, cohesive application narrative and selecting the right programmes or scholarships."
      - "**Document Review:** Provide constructive, detailed feedback on personal statements, CVs, research proposals and scholarship essays."
      - "**Interview Preparation:** Help mentees develop confidence through mock interviews, question practice and feedback on articulation and presentation."
      - "**Academic & Career Guidance:** Share insights about studying abroad, transitioning into academia or industry, and navigating life at top universities."
      - "**Confidence & Mindset Building:** Support mentees in overcoming self-doubt, impostor syndrome and cultural barriers throughout their journey."
    cta_text: "Mentor Sign-up"
    column: "col-12 lg:col-6"

  - title: "Become a Volunteer"
    url: "mailto:info@theapplicationlab.com"
    icon: "fas fa-hand-holding-hand"
    description: "**Contribute your skills to support events, outreach, community initiatives or help create educational resources that empower students worldwide.**"
    key_areas:
      - "**Outreach & Partnerships:** Help connect The Application Lab with universities, student groups and global education networks."
      - "**Events & Community Building:** Support in organising mentorship sessions, webinars and local or online meet-ups for students and mentors."
      - "**Content Creation:** Develop blog posts, guides or social media content to make the application process clearer and more accessible."
      - "**Research & Resource Development:** Contribute to building toolkits, FAQs and curated databases of scholarships, programmes and best practices."
      - "**Operations & Coordination:** Assist with scheduling, communication and tracking mentorship progress across regions."
    cta_text: "Send us an E-Mail"
    column: "col-12 lg:col-6"
---

{{ define "main" }}
<style>
.text-justify {
  text-align: justify;
  text-justify: inter-word;
}

.section-card {
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.key-area-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.key-area-list li {
  margin-bottom: 1rem;
}

.key-area-heading {
  font-weight: 600;
  display: block;
  color: #111827;
  margin-bottom: 0.25rem;
}

.key-area-description {
  text-align: justify;
  text-justify: inter-word;
  color: #333;
  margin: 0;
  line-height: 1.6;
}

.section-card p,
.section-card li {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
}
</style>

<section class="getting-involved container mx-auto px-4 my-10">
  <h1 class="text-3xl font-bold mb-4">{{ .Title }}</h1>
  <p class="text-justify text-lg mb-8">{{ .Description }}</p>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {{ range .Params.sections }}
      <div class="section-card">
        <div class="icon mb-4 text-3xl text-blue-700">
          <i class="{{ .icon }}"></i>
        </div>
        <h2 class="text-xl font-semibold mb-3">{{ .title }}</h2>
        <div class="text-justify mb-4">{{ .description | markdownify }}</div>

        <ul class="key-area-list">
          {{ range .key_areas }}
            {{ $split := split . ":" 2 }}
            <li>
              <span class="key-area-heading">{{ index $split 0 | markdownify }}</span>
              <p class="key-area-description">{{ index $split 1 | markdownify }}</p>
            </li>
          {{ end }}
        </ul>

        <a href="{{ .url }}" class="inline-block mt-5 px-5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition">
          {{ .cta_text }}
        </a>
      </div>
    {{ end }}
  </div>
</section>
{{ end }}
