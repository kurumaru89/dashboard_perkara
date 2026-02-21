<!DOCTYPE html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!--favicon-->
    <link rel="icon" href="assets/images/e-supel.png" type="image/png" />
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
    <script src="assets/js/pace.min.js"></script>
    <!-- Bootstrap CSS -->
    <link href="assets/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
    <link href="assets/css/app.css" rel="stylesheet">
    <link href="assets/css/icons.css" rel="stylesheet">
    <!-- Theme Style CSS -->
    <link rel="stylesheet" href="assets/css/dark-theme.css" />
    <link rel="stylesheet" href="assets/css/semi-dark.css" />
    <link rel="stylesheet" href="assets/css/header-colors.css" />
    <title>Dashboard Monitoring Kinerja Satuan Kerja MS Se-Aceh</title>

    <style>
        .sticky-filter {
            position: sticky;
            top: 80px;
            z-index: 1020;
            background: #fff;
            transition: box-shadow .2s ease;
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
                            <img src="assets/images/e-supel.png" class="logo-icon" alt="logo icon">
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
                <div class="card sticky-filter">
                    <div class="card-body">
                        <form id="formFilter">
                            <div class="row align-items-end">
                                <!-- Satuan Kerja -->
                                <div class="col-lg-5 col-md-6 mb-3">
                                    <label class="form-label">Satuan Kerja</label>
                                    <select class="form-select w-100 satker-select" id="satker"
                                        onchange="getSatker(this)">
                                        <?php foreach ($satker as $row) { ?>
                                            <option value="<?= $row->kode_satker ?>">
                                                <?= $row->nama_satker ?>
                                            </option>
                                        <?php } ?>
                                    </select>
                                </div>

                                <!-- Filter Tanggal -->
                                <div class="col-lg-5 col-md-6 mb-3">
                                    <label class="form-label">Filter Tanggal</label>
                                    <input type="text" id="tgl_filter" class="form-control"
                                        placeholder="Pilih Tanggal" />
                                    <input type="hidden" id="tgl_awal" />
                                    <input type="hidden" id="tgl_akhir" />
                                </div>

                                <!-- Tombol Filter -->
                                <div class="col-lg-2 col-md-12 mb-3 d-grid">
                                    <button type="button" onclick="setFilter()"
                                        class="btn btn-outline-secondary radius-30">
                                        <i class="bx bx-filter me-1"></i> Filter
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-bar-chart-alt-2 me-2"></i> Beban Perkara Satuan Kerja</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyBebanKerja" aria-expanded="true"
                                    aria-label="Toggle Beban Perkara">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyBebanKerja" class="collapse show">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-lg-4 col-md-4 col-sm-12">
                                            <div id="chartBebanKerja"></div>
                                        </div>
                                        <div class="col-lg-8 col-md-8 col-sm-12">
                                            <div id="grafikBebanKerja"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-6 col-md-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-list-check me-2"></i> Monitoring Perkara Eksekusi</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyEksekusi" aria-expanded="true"
                                    aria-label="Toggle Eksekusi">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyEksekusi" class="collapse show">
                                <div class="card-body">
                                    <div id="tabelEksekusi"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-building-house me-2"></i> Monitoring Perkara Eksekusi Hak
                                    Tanggungan</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyEksekusiHT" aria-expanded="true"
                                    aria-label="Toggle Eksekusi HT">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyEksekusiHT" class="collapse show">
                                <div class="card-body">
                                    <div id="tabelEksekusiHT"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <div class="card card-collapsible">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <span><i class="bx bx-book-open me-2"></i> Monitoring Laporan Perkara Jinayat</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyJinayat" aria-expanded="true"
                                    aria-label="Toggle Jinayat">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyJinayat" class="collapse show">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-lg-4 col-md-12">
                                            <div id="chartPerkaraJinayat"></div>
                                        </div>
                                        <div class="col-lg-8 col-md-12">
                                            <div id="tabelPerkaraJinayat"></div>
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
                                <span><i class="bx bx-book-open me-2"></i> Monitoring Laporan Perkara Jinayat
                                    Kasasi</span>
                                <button class="btn btn-sm btn-light btn-collapse" type="button"
                                    data-bs-toggle="collapse" data-bs-target="#bodyJinayatKasasi" aria-expanded="true"
                                    aria-label="Toggle Jinayat Kasasi">
                                    <i class="bx bx-chevron-up"></i>
                                </button>
                            </div>
                            <div id="bodyJinayatKasasi" class="collapse show">
                                <div class="card-body">
                                    <div id="tabelPerkaraJinayatKasasi"></div>
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
            <p class="mb-0">Copyright © 2025. All right reserved.</p>
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

    <!--app JS-->
    <script src="assets/js/app.js"></script>
    <script>
        $(document).ready(function () {
            loadDashboardPerkara('<?= $kode ?>');
        });

        $('.satker-select').select2({
            theme: 'bootstrap4',
            width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
            placeholder: $(this).data('placeholder'),
            allowClear: Boolean($(this).data('allow-clear')),
        });

        let tglFilterPicker = flatpickr('#tgl_filter', {
            mode: 'range',
            altInput: true,
            altFormat: 'd F Y',
            locale: {
                firstDayOfWeek: 7,
                rangeSeparator: " s/d ",
                weekdays: {
                    shorthand: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
                    longhand: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
                },
                months: {
                    shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                    longhand: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
                },
            },
            onReady: function (selectedDates, dateStr, instance) {
                // Kalau ada tanggal dari JSON, set langsung di sini
                if (window.tglAwalSet && window.tglAkhirSet) {
                    instance.setDate([window.tglAwalSet, window.tglAkhirSet], true);
                }
            },
            onChange: function (selectedDates) {
                if (selectedDates.length === 2) {
                    var start = selectedDates[0];
                    var end = selectedDates[1];

                    // Hitung jumlah hari valid
                    var validDays = 0;
                    var currentDate = new Date(start);

                    document.getElementById('tgl_awal').value = formatDate(start);
                    document.getElementById('tgl_akhir').value = formatDate(end);
                }
            }
        });
    </script>

</body>

</html>