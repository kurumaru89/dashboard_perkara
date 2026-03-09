<!DOCTYPE html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!--favicon (gunakan icon yang ada; ganti ke e-supel.png setelah file tersedia)-->
    <link rel="icon" href="assets/images/icons/chair.svg" type="image/svg+xml" />
    <!--plugins-->
    <link rel="stylesheet" href="assets/plugins/notifications/css/lobibox.min.css" />
    <link href="assets/plugins/simplebar/css/simplebar.css" rel="stylesheet" />
    <link href="assets/plugins/perfect-scrollbar/css/perfect-scrollbar.css" rel="stylesheet" />
    <link href="assets/plugins/metismenu/css/metisMenu.min.css" rel="stylesheet" />
    <link href="assets/plugins/flatpickr/flatpickr.min.css" rel="stylesheet" />
    <link href="assets/plugins/select2/css/select2.min.css" rel="stylesheet" />
    <link href="assets/plugins/select2/css/select2-bootstrap4.css" rel="stylesheet" />

    <!-- loader-->
    <link href="assets/css/pace.min.css" rel="stylesheet" />
    <script src="assets/js/pace.min.js" defer></script>
    <!-- Bootstrap CSS -->
    <link href="assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <link href="assets/css/app.css" rel="stylesheet">
    <link href="assets/css/icons.css" rel="stylesheet">
    <!-- Theme Style CSS -->
    <link rel="stylesheet" href="assets/css/dark-theme.css" />
    <link rel="stylesheet" href="assets/css/semi-dark.css" />
    <link rel="stylesheet" href="assets/css/header-colors.css" />
    <title>Dashboard Monitoring SAKIP Satuan Kerja MS Se-Aceh</title>

    <style>
        .sticky-filter {
            position: sticky;
            top: 80px;
            z-index: 1020;
            background: #fff;
            transition: box-shadow .2s ease;
        }

        /* Reserve space untuk konten dinamis - kurangi CLS (Lighthouse) */
        #tabelEksekusi,
        #tabelEksekusiHT,
        #tabelPerkaraJinayat,
        #tabelPerkaraJinayatKasasi {
            min-height: 180px;
        }

        #chartBebanKerja,
        #grafikBebanKerja,
        #chartPerkaraJinayat {
            min-height: 200px;
        }

        /* KPI Card Tooltip Fix */
        .kpi-card {
            cursor: help;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .kpi-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        /* Custom Tooltip Style */
        .custom-tooltip.tooltip {
            opacity: 1 !important;
            pointer-events: none;
        }

        .custom-tooltip .tooltip-inner {
            background-color: #343a40;
            color: #fff;
            padding: 6px 12px;
            font-size: 12px;
            border-radius: 4px;
            max-width: 200px;
            text-align: center;
        }

        .custom-tooltip .tooltip-arrow::before {
            border-top-color: #343a40;
        }
    </style>
</head>

<body>
    <!--wrapper-->
    <div class="wrapper">
        <!--start header -->
        <header>
            <div class="topbar d-flex align-items-center">
                <nav class="navbar navbar-expand">
                    <div class="user-box dropdown">
                        <a class="d-flex align-items-center nav-link dropdown-toggle dropdown-toggle-nocaret" href="#"
                            role="button" aria-expanded="false">
                            <img src="assets/images/icons/chair.svg" class="logo-icon" alt="Logo MRTG" width="40"
                                height="40">
                            <div class="user-info ps-3">
                                <h4 class="logo-text">MRTG (Monitoring Kinerja Satuan Kerja)</h4>
                            </div>
                        </a>
                    </div>
                </nav>
            </div>
        </header>
        <!--end header -->

        <!--start page wrapper -->
        <div class="page-wrapper">
            <div class="page-content">
                <div class="card sticky-filter card-collapsible">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span><i class="bx bx-bar-chart-alt-2 me-2"></i> Filter Data</span>
                        <button class="btn btn-sm btn-light btn-collapse" type="button" data-bs-toggle="collapse"
                            data-bs-target="#bodyFilter" aria-expanded="true" aria-label="Toggle Beban Perkara">
                            <i class="bx bx-chevron-up"></i>
                        </button>
                    </div>
                    <div class="card-body collapse show" id="bodyFilter">
                        <form id="formFilter">
                            <div class="row align-items-end">
                                <!-- Satuan Kerja -->
                                <div class="col-lg-6 col-md-6 mb-3">
                                    <label class="form-label">Satuan Kerja</label>
                                    <select class="form-select w-100 satker-select" id="satker"
                                        onchange="loadDashboardSAKIP()">
                                        <?php foreach ($satker as $row) { ?>
                                            <option value="<?= $row->kode_satker ?>">
                                                <?= $row->nama_satker ?>
                                            </option>
                                        <?php } ?>
                                    </select>
                                </div>

                                <!-- Filter Tahun -->
                                <div class="col-lg-6 col-md-6 mb-3">
                                    <label class="form-label">Filter Tahun</label>
                                    <select class="form-select w-100 tahun-select" id="tahun"
                                        onchange="loadDashboardSAKIP()">
                                        <option value="">Semua Tahun</option>
                                        <?php foreach ($tahun_perkara as $row) { ?>
                                            <option value="<?= $row->tahun ?>">
                                                <?= $row->tahun ?>
                                            </option>
                                        <?php } ?>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="row" id="sakip">
                    <div class="col-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-bar-chart-alt-2 me-2"></i> Perkara Perdata Tepat Waktu</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyPerdataTepat" aria-expanded="true"
                                    aria-label="Toggle Perdata Tepat Waktu">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyPerdataTepat" class="collapse show">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-lg-4 col-md-4 col-sm-12">
                                            <div id="piePerdataTepat"></div>
                                        </div>
                                        <div class="col-lg-8 col-md-8 col-sm-12">
                                            <div id="tabelPerdataTepat"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-bar-chart-alt-2 me-2"></i> Persentase Perkara E-Court</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyPerkaraEcourt" aria-expanded="true"
                                    aria-label="Toggle Perkara Ecourt">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyPerkaraEcourt" class="collapse show">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-lg-4 col-md-4 col-sm-12">
                                            <div id="piePerkaraEcourt"></div>
                                        </div>
                                        <div class="col-lg-8 col-md-8 col-sm-12">
                                            <div id="tabelPerkaraEcourt"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-bar-chart-alt-2 me-2"></i> Pelimpahan Perkara E-Berpadu</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyPerkaraEcourt" aria-expanded="true"
                                    aria-label="Toggle Perkara Eberpadu">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyPerkaraEcourt" class="collapse show">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-lg-4 col-md-4 col-sm-12">
                                            <div id="piePerkaraEBerpadu"></div>
                                        </div>
                                        <div class="col-lg-8 col-md-8 col-sm-12">
                                            <div id="tabelPerkaraEBerpadu"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="row">
                    <div class="col-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-bar-chart-alt-2 me-2"></i> Perkara Jinayat Tepat Waktu</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyJinayatTepat" aria-expanded="true"
                                    aria-label="Toggle Jinayat Tepat Waktu">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyJinayatTepat" class="collapse show">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-lg-4 col-md-4 col-sm-12">
                                            <div id="pieJinayatTepat"></div>
                                        </div>
                                        <div class="col-lg-8 col-md-8 col-sm-12">
                                            <div id="tabelJinayatTepat"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-bar-chart-alt-2 me-2"></i> Persentase Permohonan Pembebasan Biaya Perkara</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyProdeo" aria-expanded="true"
                                    aria-label="Toggle Prodeo">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyProdeo" class="collapse show">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-12">
                                            <div id="tabelProdeo"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--start overlay-->
        <div class="overlay toggle-icon"></div>
        <!--end overlay-->
        <!--Start Back To Top Button--> <a href="javaScript:;" class="back-to-top"><i
                class='bx bxs-up-arrow-alt'></i></a>

        <footer class="page-footer">
            <p class="mb-0">Copyright © 2026. All right reserved.</p>
        </footer>
    </div>
    <!--end wrapper-->
    <!--start switcher-->

    <!--end switcher-->
    <!-- Bootstrap JS -->
    <script src="assets/js/bootstrap.bundle.min.js"></script>
    <!--plugins-->
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/plugins/simplebar/js/simplebar.min.js"></script>
    <script src="assets/plugins/metismenu/js/metisMenu.min.js"></script>
    <script src="assets/plugins/perfect-scrollbar/js/perfect-scrollbar.js"></script>
    <script src="assets/plugins/notifications/js/lobibox.min.js"></script>
    <script src="assets/plugins/notifications/js/notifications.min.js"></script>
    <script src="assets/plugins/select2/js/select2.min.js"></script>
    <script src="assets/plugins/flatpickr/flatpickr.js"></script>
    <script src="assets/plugins/datatable/js/jquery.dataTables.min.js"></script>
    <script src="assets/plugins/datatable/js/dataTables.bootstrap5.min.js"></script>
    <script src="assets/plugins/apexcharts-bundle/js/apexcharts.min.js"></script>
    <script src="assets/plugins/sweetalert2/sweetalert2.all.min.js"></script>

    <!--app JS-->
    <script src="assets/js/app.js"></script>
    <script>
        $(document).ready(function () {
            loadDashboardSAKIP();
        });

        $('.satker-select, .tahun-select').select2({
            theme: 'bootstrap4',
            width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
            placeholder: $(this).data('placeholder'),
            allowClear: Boolean($(this).data('allow-clear')),
        });
    </script>

</body>

</html>