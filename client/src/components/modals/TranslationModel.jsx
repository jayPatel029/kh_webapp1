// Import React and useState
import React from "react";

// Define the AlarmModal component
const TranslationModal = ({
  closeModal,
  languages,
  setTranslations,
  translations,
}) => {
  // JSX structure of TranslationModal component
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black overflow-y-auto">
        <div className="p-7 mt-4 bg-white shadow-md border-t-4 w-1/2 border-primary rounded z-50 overflow-y-auto h-3/4">
          <div className="border-b-2 border-gray-200 text-xl font-semibold p-4 text-primary">
            Set Translations
          </div>

          <div>
            {languages.map((language, index) => {
              if (language.id !== 1)
              return (
                <div key={index} className="flex flex-col mt-4">
                  <label>{language.language_name}</label>
                  <input
                    type="text"
                    className="border border-primary  rounded-lg p-1.5"
                    value={translations[language.id]}
                    onChange={(e) => {
                      setTranslations({
                        ...translations,
                        [language.id]: e.target.value,
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>

          <button
            className=" flex-1 mt-6 border md:inline-block text-white bg-primary text-lg border-gray-300 w-1/3 rounded-lg p-1.5"
            onClick={closeModal}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

// Export the TranslationModal component
export default TranslationModal;
