import React, { useState } from "react";
import "./HookForm.css";

// Data for dropdown options
const EMOTION_OPTIONS = [
  "Confusion",
  "Anger",
  "Doubt",
  "Sadness",
  "Guilt",
  "Frustration",
  "Loneliness",
  "Bitterness",
  "Resentment",
  "Peace",
  "Faith",
  "Despair",
];

const THEME_OPTIONS = [
  "Growth",
  "Religion",
  "God",
  "Masculinity",
  "Morality",
  "Mental Health",
  "Pain",
  "Discipline",
  "Truth",
  "Relationships",
  "Purpose",
];

const TONE_OPTIONS = [
  "Calm",
  "Heated",
  "Raw",
  "Sarcastic",
  "Reflective",
  "Spiritual",
  "Dramatic",
  "Broken",
];

const HookForm = ({ onSubmit, isDisabled }) => {
  const [formData, setFormData] = useState({
    hook: "",
    context: "",
    emotion: "",
    theme: "",
    tone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.hook ||
      !formData.context ||
      !formData.emotion ||
      !formData.theme
    ) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="hook-form-container">
      <form className="hook-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="hook">
            Hook Sentence <span className="required">*</span>
          </label>
          <textarea
            id="hook"
            name="hook"
            placeholder="Enter the first line of your video script..."
            value={formData.hook}
            onChange={handleChange}
            disabled={isDisabled}
            required
          />
          <p className="field-description">
            This is the opening line of your video that viewers will hear first.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="context">
            Scene Context <span className="required">*</span>
          </label>
          <textarea
            id="context"
            name="context"
            placeholder="Describe the scene in 1-2 sentences..."
            value={formData.context}
            onChange={handleChange}
            disabled={isDisabled}
            required
          />
          <p className="field-description">
            Brief description of what the scene is about.
          </p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="emotion">
              Emotion <span className="required">*</span>
            </label>
            <select
              id="emotion"
              name="emotion"
              value={formData.emotion}
              onChange={handleChange}
              disabled={isDisabled}
              required
            >
              <option value="">Select an emotion</option>
              {EMOTION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="theme">
              Theme <span className="required">*</span>
            </label>
            <select
              id="theme"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              disabled={isDisabled}
              required
            >
              <option value="">Select a theme</option>
              {THEME_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tone">
              Tone <span className="optional">(optional)</span>
            </label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              disabled={isDisabled}
            >
              <option value="">Select a tone</option>
              {TONE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={isDisabled}>
          {isDisabled ? "Analyzing..." : "Analyze Hook"}
        </button>
      </form>
    </div>
  );
};

export default HookForm;
