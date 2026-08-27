/**
 * Secondary work, rendered as a compact grid.
 * Kept in one place so adding a repository is a single-object edit.
 */
export const REPOS = [
  {
    name: 'Oil Palm Health Detection',
    repo: 'Deteksi-dan-Klasifikasi-Kesehatan-Pohon-Sawit-Menggunakan-Deep-Learning-pada-Citra-Udara',
    blurb:
      'YOLOv8s detects individual trees in aerial imagery, then ResNet18 classifies each crop with NDVI masking applied first to sharpen the vegetation signal. Served through a Gradio app.',
    tags: ['YOLOv8', 'ResNet18', 'NDVI', 'Gradio'],
  },
  {
    name: 'Flowchart Reader for Blind Learners',
    repo: 'Object-Detection-for-Visually-Impaired-Education',
    blurb:
      'Object detection reads physical flowchart blocks a student lays out by hand, so programming logic can be checked without any visual feedback loop.',
    tags: ['Object Detection', 'Assistive Tech'],
  },
  {
    name: 'Medical Sound Classification',
    repo: 'Medical-Sound-Classification-using-Log-Mel-Spectrogram-and-MFCC-for-identifying-Asthma-and-COPD-',
    blurb:
      'Respiratory audio classified into asthma and COPD from log-mel spectrograms and MFCC features, sharing the acoustic front end used in the TB cough work.',
    tags: ['Log-Mel', 'MFCC', 'Audio'],
  },
  {
    name: 'Semi-Supervised Food Classification',
    repo: 'Klasifikasi-Makanan-Tradisional-Indonesia-dengan-Semi-Supervised-Learning-',
    blurb:
      'Indonesian traditional food recognition trained where labels are scarce, using pseudo-labelling to pull unlabelled images into the training set.',
    tags: ['Semi-Supervised', 'Pseudo-Labelling'],
  },
  {
    name: 'Pseudo-Labelling on Bank Transactions',
    repo: 'Semi-Supervised-Learning-and-Pseudo-Labeling-on-Bank-Transactions-using-Clustering-Classification',
    blurb:
      'Clustering generates labels for an unlabelled transaction set, which a downstream classifier then learns from. Tests how far cluster quality carries the label quality.',
    tags: ['Clustering', 'Classification'],
  },
  {
    name: 'Stress Classification, Pinball Loss',
    repo: 'Stress-Level-Classification-with-Pinball-Loss',
    blurb:
      'SVM with a flexible pinball loss instead of hinge, trading margin maximisation for noise robustness on student stress data.',
    tags: ['SVM', 'Pinball Loss'],
  },
  {
    name: 'EEG Binary Encoding',
    repo: 'EEG_BinaryEncoding',
    blurb:
      'Feature extraction and encoding experiments behind the ALS screening pipeline, run across segmented EEG tasks and frequency subbands.',
    tags: ['EEG', 'Signal Processing'],
  },
  {
    name: 'TB Meningitis',
    repo: 'TB_Meningitis',
    blurb:
      'Modelling work on tuberculous meningitis as part of the wider TB detection and diagnostic programme.',
    tags: ['Medical ML'],
  },
  {
    name: 'Waste Classification',
    repo: 'klasifikasi-sampah-abmas',
    blurb:
      'Image classifier for waste sorting, built for a community service deployment where inference has to run on modest hardware.',
    tags: ['Computer Vision', 'Deployment'],
  },
  {
    name: 'LLM Deployment Exercise',
    repo: 'KCV_Deployment_LLM',
    blurb:
      'Serving path for a language model behind a web front end, covering the request lifecycle from browser through to model response.',
    tags: ['LLM', 'Serving'],
  },
];
