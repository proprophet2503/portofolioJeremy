/**
 * Further projects, grouped by application area.
 * Kept in one place so adding a project is a single-object edit.
 * `repo` is optional: projects without a public repository render as plain cards.
 */
export const AREAS = [
  'Medical and clinical ML',
  'Computer vision',
  'Learning with scarce labels',
  'Systems and serving',
];

export const REPOS = [
  {
    area: 'Medical and clinical ML',
    name: 'TB Meningitis Mortality Stratification',
    repo: 'TB_Meningitis',
    blurb:
      'XGBoost model for early three-month mortality risk in tuberculous meningitis (AUROC 0.825), with an interpretable eight-feature logistic surrogate built from SHAP-selected predictors (AUROC 0.815). Presented as an e-poster at the ASEAN4TB Conference.',
    tags: ['XGBoost', 'SHAP', 'Decision Curve Analysis'],
  },
  {
    area: 'Medical and clinical ML',
    name: 'Kidney Cyst Segmentation',
    status: 'in progress',
    blurb:
      'Deep learning segmentation pipelines for kidney cysts, developed and evaluated with laboratory researchers and clinicians from Rumah Sakit Universitas Airlangga.',
    tags: ['Segmentation', 'Medical Imaging'],
  },
  {
    area: 'Medical and clinical ML',
    name: 'Medical Sound Classification',
    repo: 'Medical-Sound-Classification-using-Log-Mel-Spectrogram-and-MFCC-for-identifying-Asthma-and-COPD-',
    blurb:
      'Respiratory audio classified into asthma and COPD from log-mel spectrograms and MFCC features, sharing the acoustic front end used in the TB cough work.',
    tags: ['Log-Mel', 'MFCC', 'Audio'],
  },
  {
    area: 'Computer vision',
    name: 'Oil Palm Health Detection',
    repo: 'Deteksi-dan-Klasifikasi-Kesehatan-Pohon-Sawit-Menggunakan-Deep-Learning-pada-Citra-Udara',
    blurb:
      'YOLOv8s detects individual trees in aerial imagery, then ResNet-18 classifies each crop with NDVI masking applied first to sharpen the vegetation signal. Served through a Gradio app on Hugging Face Spaces.',
    tags: ['YOLOv8', 'ResNet-18', 'NDVI', 'Gradio'],
  },
  {
    area: 'Computer vision',
    name: 'CodeSight: Flowchart Reader for Blind Learners',
    repo: 'Object-Detection-for-Visually-Impaired-Education',
    blurb:
      'YOLOv8 reads physical flowchart blocks that a student lays out by hand and translates them into executable code, so visually impaired students can learn programming logic by touch.',
    tags: ['YOLOv8', 'Assistive Tech'],
  },
  {
    area: 'Computer vision',
    name: 'Tilapia Disease Classification',
    blurb:
      'A custom CNN with a Convolutional Block Attention Module that detects fish diseases and classifies health status, for a digital village solution in tilapia farming. Top 50, Innovillage by Telkom Indonesia.',
    tags: ['CNN', 'CBAM', 'Social Impact'],
  },
  {
    area: 'Computer vision',
    name: 'Waste Classification',
    repo: 'klasifikasi-sampah-abmas',
    blurb:
      'Image classifier for waste sorting, built for a community service deployment where inference has to run on modest hardware.',
    tags: ['Computer Vision', 'Deployment'],
  },
  {
    area: 'Learning with scarce labels',
    name: 'Semi-Supervised Food Classification',
    repo: 'Klasifikasi-Makanan-Tradisional-Indonesia-dengan-Semi-Supervised-Learning-',
    blurb:
      'Indonesian traditional food recognition trained where labels are scarce, using pseudo-labelling to pull unlabelled images into the training set.',
    tags: ['Semi-Supervised', 'Pseudo-Labelling'],
  },
  {
    area: 'Learning with scarce labels',
    name: 'Pseudo-Labelling on Bank Transactions',
    repo: 'Semi-Supervised-Learning-and-Pseudo-Labeling-on-Bank-Transactions-using-Clustering-Classification',
    blurb:
      'Clustering generates labels for an unlabelled transaction set, which a downstream classifier then learns from. Tests how far cluster quality carries the label quality.',
    tags: ['Clustering', 'Classification'],
  },
  {
    area: 'Learning with scarce labels',
    name: 'Stress Classification, Pinball Loss',
    repo: 'Stress-Level-Classification-with-Pinball-Loss',
    blurb:
      'SVM with a flexible pinball loss instead of hinge, trading margin maximisation for noise robustness on student stress data.',
    tags: ['SVM', 'Pinball Loss'],
  },
  {
    area: 'Systems and serving',
    name: 'REXTRA LLM Inference Backend',
    blurb:
      'REST API infrastructure for LLM inference with request routing, retries and failover across multiple model providers, plus connection handling tuned to cut end-to-end latency.',
    tags: ['REST APIs', 'LLM Serving', 'Docker'],
  },
  {
    area: 'Systems and serving',
    name: 'LLM Deployment Exercise',
    repo: 'KCV_Deployment_LLM',
    blurb:
      'Serving path for a language model behind a web front end, covering the request lifecycle from browser through to model response.',
    tags: ['LLM', 'Serving'],
  },
];
