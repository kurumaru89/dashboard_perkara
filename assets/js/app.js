$(function () {
	"use strict";
	// search bar
	$(".mobile-search-icon").on("click", function () {
		$(".search-bar").addClass("full-search-bar");
	});
	$(".search-close").on("click", function () {
		$(".search-bar").removeClass("full-search-bar");
	});
	$(".mobile-toggle-menu").on("click", function () {
		$(".wrapper").addClass("toggled");
	});
	// toggle menu button
	$(".toggle-icon").click(function () {
		if ($(".wrapper").hasClass("toggled")) {
			// unpin sidebar when hovered
			$(".wrapper").removeClass("toggled");
			$(".sidebar-wrapper").unbind("hover");
		} else {
			$(".wrapper").addClass("toggled");
			$(".sidebar-wrapper").hover(function () {
				$(".wrapper").addClass("sidebar-hovered");
			}, function () {
				$(".wrapper").removeClass("sidebar-hovered");
			})
		}
	});
	/* Back To Top */
	$(document).ready(function () {
		$(window).on("scroll", function () {
			if ($(this).scrollTop() > 300) {
				$('.back-to-top').fadeIn();
			} else {
				$('.back-to-top').fadeOut();
			}
		});
		$('.back-to-top').on("click", function () {
			$("html, body").animate({
				scrollTop: 0
			}, 600);
			return false;
		});
	});
	$(function () {
		for (var i = window.location, o = $(".metismenu li a").filter(function () {
			return this.href == i;
		}).addClass("").parent().addClass(""); ;) {
			if (!o.is("li")) break;
			o = o.parent("").addClass("").parent("").addClass("");
		}
	}),
		// metismenu
		$(function () {
			$('#menu').metisMenu();
		});
	// chat toggle
	$(".chat-toggle-btn").on("click", function () {
		$(".chat-wrapper").toggleClass("chat-toggled");
	});
	$(".chat-toggle-btn-mobile").on("click", function () {
		$(".chat-wrapper").removeClass("chat-toggled");
	});
	// email toggle
	$(".email-toggle-btn").on("click", function () {
		$(".email-wrapper").toggleClass("email-toggled");
	});
	$(".email-toggle-btn-mobile").on("click", function () {
		$(".email-wrapper").removeClass("email-toggled");
	});
	// compose mail
	$(".compose-mail-btn").on("click", function () {
		$(".compose-mail-popup").show();
	});
	$(".compose-mail-close").on("click", function () {
		$(".compose-mail-popup").hide();
	});
	/*switcher*/
	$(".switcher-btn").on("click", function () {
		$(".switcher-wrapper").toggleClass("switcher-toggled");
	});
	$(".close-switcher").on("click", function () {
		$(".switcher-wrapper").removeClass("switcher-toggled");
	});
	$("#lightmode").on("click", function () {
		$('html').attr('class', 'light-theme');
	});
	$("#darkmode").on("click", function () {
		$('html').attr('class', 'dark-theme');
	});
	$("#semidark").on("click", function () {
		$('html').attr('class', 'semi-dark');
	});
	$("#minimaltheme").on("click", function () {
		$('html').attr('class', 'minimal-theme');
	});
	$("#headercolor1").on("click", function () {
		$("html").addClass("color-header headercolor1");
		$("html").removeClass("headercolor2 headercolor3 headercolor4 headercolor5 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor2").on("click", function () {
		$("html").addClass("color-header headercolor2");
		$("html").removeClass("headercolor1 headercolor3 headercolor4 headercolor5 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor3").on("click", function () {
		$("html").addClass("color-header headercolor3");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor5 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor4").on("click", function () {
		$("html").addClass("color-header headercolor4");
		$("html").removeClass("headercolor1 headercolor2 headercolor3 headercolor5 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor5").on("click", function () {
		$("html").addClass("color-header headercolor5");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor3 headercolor6 headercolor7 headercolor8");
	});
	$("#headercolor6").on("click", function () {
		$("html").addClass("color-header headercolor6");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor5 headercolor3 headercolor7 headercolor8");
	});
	$("#headercolor7").on("click", function () {
		$("html").addClass("color-header headercolor7");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor5 headercolor6 headercolor3 headercolor8");
	});
	$("#headercolor8").on("click", function () {
		$("html").addClass("color-header headercolor8");
		$("html").removeClass("headercolor1 headercolor2 headercolor4 headercolor5 headercolor6 headercolor7 headercolor3");
	});

	loadChartBebanKerja();
});

function notifikasi(pesan, result) {
	let icon;
	if (result == '1') {
		result = 'success';
		icon = 'bx bx-check-circle';
	} else if (result == '2') {
		result = 'warning';
		icon = 'bx bx-error';
	} else if (result == '3') {
		result = 'error';
		icon = 'bx bx-x-circle';
	} else {
		result = 'info';
		icon = 'bx bx-info-circle';
	}

	Lobibox.notify(result, {
		pauseDelayOnHover: true,
		continueDelayOnInactiveTab: false,
		position: 'top right',
		icon: icon,
		sound: false,
		msg: pesan
	});
}

function getSatker(select) {
	loadDashboardPerkara(select.value);
	//loadPiePerkara(select.value);
}

function setFilter() {
	let satker = document.getElementById('satker').value;
	loadDashboardPerkara(satker);
}

function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Tambahkan 1 karena bulan dimulai dari 0
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function loadDashboardPerkara(kode) {
	let tgl_awal = document.getElementById('tgl_awal').value;
	let tgl_akhir = document.getElementById('tgl_akhir').value;
	loadPiePerkara(kode);

	if (tgl_awal && tgl_akhir) {
		loadTabelEksekusi(kode, tgl_awal, tgl_akhir);
		loadTabelEksekusiHT(kode, tgl_awal, tgl_akhir);
		loadTabelPerkaraJinayat(kode, tgl_awal, tgl_akhir);
		loadTabelPerkaraJinayatKasasi(kode, tgl_awal, tgl_akhir);
		loadChartJinayat(kode, tgl_awal, tgl_akhir);
	} else {
		loadTabelEksekusi(kode);
		loadTabelEksekusiHT(kode);
		loadTabelPerkaraJinayat(kode);
		loadTabelPerkaraJinayatKasasi(kode);
		loadChartJinayat(kode);
	}

	notifikasi("Menampilkan data satuan kerja", 1);
}

function loadTabelEksekusi(kode, tgl_awal = null, tgl_akhir = null) {
	const postData = { kode, ...(tgl_awal && tgl_akhir && { tgl_awal, tgl_akhir }) };

	// Destroy DataTable lama jika sudah ada
	if ($.fn.DataTable.isDataTable('#tabelEksekusiData')) {
		$('#tabelEksekusiData').DataTable().destroy();
	}

	$.post('show_eksekusi', postData, function (response) {
		try {
			const { data_eksekusi } = JSON.parse(response);
			const $container = $('#tabelEksekusi').empty();

			// Cek data kosong
			if (!data_eksekusi?.length) {
				$container.html(`
                    <div class="row">
                        <div class="col">
                            <div class="alert border-0 border-start border-5 border-info py-2">
                                <div class="d-flex align-items-center">
                                    <div class="font-35 text-info"><i class="bx bx-info-square"></i></div>
                                    <div class="ms-3">
                                        <h6 class="mb-0 text-info">Informasi</h6>
                                        <div>Belum Ada Perkara Eksekusi, atau belum ada sinkronisasi ke satker daerah.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
				return;
			}

			// Helper: format tanggal
			const formatTanggal = (tgl) => {
				if (!tgl) return null;
				const d = new Date(tgl);
				if (isNaN(d)) return tgl;
				return d.toLocaleDateString('id-ID', {
					day: '2-digit',
					month: 'short',
					year: 'numeric'
				});
			};

			// Helper: render tanggal tahapan dengan badge
			const badgeTahapan = (val) => {
				if (!val || val == '0000-00-00') return '<span class="badge bg-secondary bg-opacity-75">Belum Ada</span>';
				const formatted = formatTanggal(val);
				return `<span class="badge bg-success bg-opacity-75">${formatted}</span>`;
			};

			// Build rows
			const rows = data_eksekusi.map((row, i) => `
                <tr>
                    <td class="text-center align-middle">${i + 1}</td>
                    <td class="align-middle">
                        <small class="fw-semibold">${row.nama_satker ?? '-'}</small>
                    </td>
                    <td class="align-middle">
                        <span class="fw-semibold text-primary">${row.nomor_perkara_pn ?? '-'}</span>
                    </td>
                    <td class="align-middle">
                        <span class="fw-semibold text-primary">${row.nomor_register_eksekusi ?? '-'}</span>
                    </td>
                    <td class="text-center align-middle">${badgeTahapan(row.permohonan_eksekusi)}</td>
                    <td class="text-center align-middle">${badgeTahapan(row.penetapan_teguran_eksekusi)}</td>
                    <td class="text-center align-middle">${badgeTahapan(row.pelaksanaan_teguran_eksekusi)}</td>
                    <td class="text-center align-middle">${badgeTahapan(row.penetapan_sita_eksekusi)}</td>
                    <td class="text-center align-middle">${badgeTahapan(row.pelaksanaan_sita_eksekusi)}</td>
                </tr>
            `).join('');

			$container.html(`
                <div class="table-responsive">
                    <table id="tabelEksekusiData"
                           class="table table-striped table-bordered table-hover align-middle"
                           style="width:100%">
                        <thead class="table-dark">
                            <tr>
                                <th class="text-center" style="width:45px">No</th>
                                <th>Nama Satker</th>
                                <th>No. Perkara Perdata</th>
                                <th>No. Perkara Eksekusi</th>
                                <th class="text-center">Permohonan</th>
                                <th class="text-center">Penetapan Teguran</th>
                                <th class="text-center">Pelaksanaan Teguran</th>
                                <th class="text-center">Penetapan Sita</th>
                                <th class="text-center">Pelaksanaan Sita</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                        <tfoot class="table-light">
                            <tr>
                                <th colspan="9" class="text-end pe-3">
                                    Total Perkara:
                                    <span class="badge bg-dark fs-6">${data_eksekusi.length}</span>
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `);

			// Inisialisasi DataTable
			$('#tabelEksekusiData').DataTable({
				order: [[4, 'desc']],
				pageLength: 10,
				lengthMenu: [
					[10, 25, 50, 100],
					['10 baris', '25 baris', '50 baris', '100 baris']
				],
				dom:
					"<'row mt-2'<'col-sm-12'B>>" +
					"<'row mb-3'" +
					"  <'col-sm-12 col-md-4'd>" +
					"  <'col-sm-12 col-md-4'l>" +
					"  <'col-sm-12 col-md-4'f>" +
					">" +
					"<'row'<'col-sm-12'tr>>" +
					"<'row mt-2'" +
					"  <'col-sm-12 col-md-5'i>" +
					"  <'col-sm-12 col-md-7'p>" +
					">",
				buttons: [
					{
						extend: 'excelHtml5',
						text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
						title: 'Data Eksekusi Perkara',
						className: 'btn btn-sm btn-outline-success me-2',
						exportOptions: {
							columns: ':visible',
							format: {
								body: (data) => {
									const temp = document.createElement('div');
									temp.innerHTML = data;
									return temp.textContent || temp.innerText || '';
								}
							}
						}
					},
					{
						extend: 'colvis',
						text: '<i class="bx bx-columns me-1"></i> Kolom',
						className: 'btn btn-sm btn-outline-secondary'
					}
				],
				language: {
					search: '',
					searchPlaceholder: 'Cari perkara...',
					lengthMenu: 'Tampilkan _MENU_',
					info: 'Menampilkan _START_ - _END_ dari _TOTAL_ perkara',
					infoEmpty: 'Tidak ada data',
					infoFiltered: '(difilter dari _MAX_ total perkara)',
					zeroRecords: 'Tidak ditemukan perkara yang sesuai',
					paginate: {
						first: '<i class="bx bx-chevrons-left"></i>',
						last: '<i class="bx bx-chevrons-right"></i>',
						next: '<i class="bx bx-chevron-right"></i>',
						previous: '<i class="bx bx-chevron-left"></i>'
					}
				},
				columnDefs: [
					{
						targets: 0,
						orderable: false,
						searchable: false,
						className: 'text-center'
					},
					{ targets: [4, 5, 6, 7, 8], className: 'text-center' }
				],
				drawCallback: function () {
					const api = this.api();
					api.column(0, { search: 'applied', order: 'applied', page: 'current' })
						.nodes()
						.each(function (cell, i) {
							cell.innerHTML = api.page.info().start + i + 1;
						});
				}
			});

		} catch (e) {
			console.error('Gagal parsing JSON:', e);
			$('#tabelEksekusi').html(
				`<div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bx bx-error-circle fs-4 me-2"></i>
                    <div>Gagal memuat data eksekusi. Silakan coba lagi.</div>
                </div>`
			);
		}
	});
}

function loadTabelEksekusiHT(kode, tgl_awal = null, tgl_akhir = null) {
	const postData = { kode, ...(tgl_awal && tgl_akhir && { tgl_awal, tgl_akhir }) };

	// Destroy DataTable lama jika sudah ada
	if ($.fn.DataTable.isDataTable('#tabelEksekusiHTData')) {
		$('#tabelEksekusiHTData').DataTable().destroy();
	}

	// FIX: gunakan postData agar filter tanggal ikut terkirim
	$.post('show_eksekusi_ht', postData, function (response) {
		try {
			const { data_eksekusi_ht } = JSON.parse(response);
			const $container = $('#tabelEksekusiHT').empty();

			// Cek data kosong
			if (!data_eksekusi_ht?.length) {
				$container.html(`
                    <div class="row">
                        <div class="col">
                            <div class="alert border-0 border-start border-5 border-info py-2">
                                <div class="d-flex align-items-center">
                                    <div class="font-35 text-info"><i class="bx bx-info-square"></i></div>
                                    <div class="ms-3">
                                        <h6 class="mb-0 text-info">Informasi</h6>
                                        <div>Belum Ada Perkara Eksekusi HT, atau belum ada sinkronisasi ke satker daerah.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
				return;
			}

			// Helper: format tanggal
			const formatTanggal = (tgl) => {
				if (!tgl) return null;
				const d = new Date(tgl);
				if (isNaN(d)) return tgl;
				return d.toLocaleDateString('id-ID', {
					day: '2-digit',
					month: 'short',
					year: 'numeric'
				});
			};

			// Helper: render tanggal tahapan dengan badge
			const badgeTahapan = (val) => {
				if (!val || val == '0000-00-00') return '<span class="badge bg-secondary bg-opacity-75">Belum Ada</span>';
				const formatted = formatTanggal(val);
				return `<span class="badge bg-success bg-opacity-75">${formatted}</span>`;
			};

			// Build rows
			const rows = data_eksekusi_ht.map((row, i) => `
                <tr>
                    <td class="text-center align-middle">${i + 1}</td>
                    <td class="align-middle">
                        <small class="fw-semibold">${row.nama_satker ?? '-'}</small>
                    </td>
                    <td class="align-middle">
                        <span class="fw-semibold text-primary">${row.nomor_register_eksekusi ?? '-'}</span>
                    </td>
                    <td class="text-center align-middle">${badgeTahapan(row.permohonan_eksekusi)}</td>
                    <td class="text-center align-middle">${badgeTahapan(row.penetapan_teguran_eksekusi)}</td>
                    <td class="text-center align-middle">${badgeTahapan(row.pelaksanaan_teguran_eksekusi)}</td>
                    <td class="text-center align-middle">${badgeTahapan(row.penetapan_sita_eksekusi)}</td>
                    <td class="text-center align-middle">${badgeTahapan(row.pelaksanaan_sita_eksekusi)}</td>
                </tr>
            `).join('');

			$container.html(`
                <div class="table-responsive">
                    <table id="tabelEksekusiHTData"
                           class="table table-striped table-bordered table-hover align-middle"
                           style="width:100%">
                        <thead class="table-dark">
                            <tr>
                                <th class="text-center" style="width:45px">No</th>
                                <th>Nama Satker</th>
                                <th>No. Perkara Eksekusi</th>
                                <th class="text-center">Permohonan</th>
                                <th class="text-center">Penetapan Teguran</th>
                                <th class="text-center">Pelaksanaan Teguran</th>
                                <th class="text-center">Penetapan Sita</th>
                                <th class="text-center">Pelaksanaan Sita</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                        <tfoot class="table-light">
                            <tr>
                                <th colspan="8" class="text-end pe-3">
                                    Total Perkara:
                                    <span class="badge bg-dark fs-6">${data_eksekusi_ht.length}</span>
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `);

			// Inisialisasi DataTable
			$('#tabelEksekusiHTData').DataTable({
				order: [[3, 'desc']],
				pageLength: 10,
				lengthMenu: [
					[10, 25, 50, 100],
					['10 baris', '25 baris', '50 baris', '100 baris']
				],
				dom:
					"<'row mt-2'<'col-sm-12'B>>" +
					"<'row mb-3'" +
					"  <'col-sm-12 col-md-4'd>" +
					"  <'col-sm-12 col-md-4'l>" +
					"  <'col-sm-12 col-md-4'f>" +
					">" +
					"<'row'<'col-sm-12'tr>>" +
					"<'row mt-2'" +
					"  <'col-sm-12 col-md-5'i>" +
					"  <'col-sm-12 col-md-7'p>" +
					">",
				buttons: [
					{
						extend: 'excelHtml5',
						text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
						title: 'Data Eksekusi Perkara Hak Tanggungan',
						className: 'btn btn-sm btn-outline-success me-2',
						exportOptions: {
							columns: ':visible',
							format: {
								body: (data) => {
									const temp = document.createElement('div');
									temp.innerHTML = data;
									return temp.textContent || temp.innerText || '';
								}
							}
						}
					},
					{
						extend: 'colvis',
						text: '<i class="bx bx-columns me-1"></i> Kolom',
						className: 'btn btn-sm btn-outline-secondary'
					}
				],
				language: {
					search: '',
					searchPlaceholder: 'Cari perkara...',
					lengthMenu: 'Tampilkan _MENU_',
					info: 'Menampilkan _START_ - _END_ dari _TOTAL_ perkara',
					infoEmpty: 'Tidak ada data',
					infoFiltered: '(difilter dari _MAX_ total perkara)',
					zeroRecords: 'Tidak ditemukan perkara yang sesuai',
					paginate: {
						first: '<i class="bx bx-chevrons-left"></i>',
						last: '<i class="bx bx-chevrons-right"></i>',
						next: '<i class="bx bx-chevron-right"></i>',
						previous: '<i class="bx bx-chevron-left"></i>'
					}
				},
				columnDefs: [
					{
						targets: 0,
						orderable: false,
						searchable: false,
						className: 'text-center'
					},
					{ targets: [3, 4, 5, 6, 7], className: 'text-center' }
				],
				drawCallback: function () {
					const api = this.api();
					api.column(0, { search: 'applied', order: 'applied', page: 'current' })
						.nodes()
						.each(function (cell, i) {
							cell.innerHTML = api.page.info().start + i + 1;
						});
				}
			});

		} catch (e) {
			console.error('Gagal parsing JSON:', e);
			$('#tabelEksekusiHT').html(
				`<div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bx bx-error-circle fs-4 me-2"></i>
                    <div>Gagal memuat data eksekusi hak tanggungan. Silakan coba lagi.</div>
                </div>`
			);
		}
	});
}

function loadChartBebanKerja() {

	$.ajax({
		url: 'get_chart_beban_perkara',
		type: 'GET',
		dataType: 'json',
		success: function (response) {

			var options = {
				series: [{
					name: 'Perkara Masuk Tahun Ini',
					data: response.perkara_masuk
				}, {
					name: 'Sisa Perkara Tahun Lalu',
					data: response.sisa_perkara
				}],
				chart: {
					foreColor: '#9ba7b2',
					type: 'bar',
					height: 360
				},
				plotOptions: {
					bar: {
						horizontal: false,
						columnWidth: '55%',
						endingShape: 'rounded'
					},
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					show: true,
					width: 2,
					colors: ['transparent']
				},
				title: {
					text: 'Grafik Beban Kerja Per Satker',
					align: 'left',
					style: {
						fontSize: '14px'
					}
				},
				colors: ['#0d6efd', '#ffc107'],
				xaxis: {
					categories: response.categories
				},
				yaxis: {
					title: {
						text: 'Jumlah Perkara'
					}
				},
				fill: {
					opacity: 1
				},
				tooltip: {
					y: {
						formatter: function (val) {
							return val + " Perkara"
						}
					}
				}
			};

			var chart = new ApexCharts(
				document.querySelector("#grafikBebanKerja"),
				options
			);

			chart.render();
		}
	});
}

var pieChart = null;
function loadPiePerkara(kode_satker) {

	$.ajax({
		url: 'get_pie_beban_perkara',
		type: "GET",
		data: { kode_satker: kode_satker },
		dataType: "json",
		beforeSend: function () {
			$("#chartBebanKerja").html("<div class='text-center p-5'>Loading chart...</div>");
		},
		success: function (res) {

			$("#chartBebanKerja").html("");

			// destroy chart lama (WAJIB supaya tidak numpuk)
			if (pieChart !== null) {
				pieChart.destroy();
			}

			var options = {
				series: [res.masuk, res.sisa],
				chart: {
					foreColor: '#9ba7b2',
					height: 330,
					type: 'donut',
				},
				colors: ["#0d6efd", "#f41127"],
				labels: ['Perkara Masuk Tahun Ini', 'Sisa Perkara Tahun Lalu'],
				legend: { position: 'bottom' },
				dataLabels: {
					formatter: function (val, opts) {
						return opts.w.config.series[opts.seriesIndex] + " perkara";
					}
				},
				tooltip: {
					y: {
						formatter: function (val) {
							return val + " perkara";
						}
					}
				}
			};

			pieChart = new ApexCharts(document.querySelector("#chartBebanKerja"), options);
			pieChart.render();
		}
	});
}

function loadTabelPerkaraJinayat(kode, tgl_awal = null, tgl_akhir = null) {
	const postData = { kode, ...(tgl_awal && tgl_akhir && { tgl_awal, tgl_akhir }) };

	// Destroy DataTable lama jika sudah ada (mencegah reinit error)
	if ($.fn.DataTable.isDataTable('#tabelPerkaraJinayatData')) {
		$('#tabelPerkaraJinayatData').DataTable().destroy();
	}

	$.post('show_jinayat', postData, function (response) {
		try {
			const { data_jinayat } = JSON.parse(response);
			const $container = $('#tabelPerkaraJinayat').empty();

			// Cek data kosong
			if (!data_jinayat?.length) {
				$container.html(`
                    <div class="row">
                        <div class="col">
                            <div class="alert border-0 border-start border-5 border-info py-2">
                                <div class="d-flex align-items-center">
                                    <div class="font-35 text-info"><i class="bx bx-info-square"></i></div>
                                    <div class="ms-3">
                                        <h6 class="mb-0 text-info">Informasi</h6>
                                        <div>Belum Ada Perkara Jinayat, atau belum ada sinkronisasi ke satker daerah.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
				return;
			}

			// Helper: format tanggal agar lebih readable
			const formatTanggal = (tgl) => {
				if (!tgl) return null;
				const d = new Date(tgl);
				if (isNaN(d)) return tgl;
				return d.toLocaleDateString('id-ID', {
					day: '2-digit',
					month: 'short',
					year: 'numeric'
				});
			};

			// Helper: badge generator berdasarkan jenis hukuman
			const badgeHukuman = (hukuman) => {
				if (!hukuman) return '<span class="badge bg-secondary bg-opacity-75">Belum Putus</span>';
				const s = hukuman.toLowerCase();
				let badgeClass = 'bg-primary';
				if (s.includes('penjara') || s.includes('cambuk') || s.includes('kurungan'))
					badgeClass = 'bg-danger';
				else if (s.includes('bebas') || s.includes('lepas'))
					badgeClass = 'bg-success';
				else if (s.includes('denda') || s.includes('restitusi'))
					badgeClass = 'bg-warning text-dark';
				return `<span class="badge ${badgeClass}">${hukuman}</span>`;
			};

			// Build rows
			const rows = data_jinayat.map((row, i) => {
				const tglPendaftaran = formatTanggal(row.tanggal_pendaftaran) || '-';
				const tglPutusan = row.tanggal_putusan
					? formatTanggal(row.tanggal_putusan)
					: '<span class="badge bg-secondary bg-opacity-75">Belum Putus</span>';
				const jenisPutusan = row.tanggal_putusan
					? badgeHukuman(row.jenis_hukuman)
					: '<span class="badge bg-secondary bg-opacity-75">Belum Putus</span>';
				const nama = row.nama_terdakwa || '<span class="text-muted fst-italic">Belum Ada Data</span>';
				const usia = row.usia
					? `<span class="badge bg-info bg-opacity-75 text-dark">${row.usia} th</span>`
					: '<span class="text-muted fst-italic">Belum Ada Data</span>';

				return `
                    <tr>
                        <td class="text-center align-middle">${i + 1}</td>
                        <td class="align-middle text-break">
                            <small class="fw-semibold">${row.nama_satker ?? '-'}</small>
                        </td>
                        <td class="align-middle text-break">
                            <span class="fw-semibold text-primary">${row.nomor_perkara ?? '-'}</span>
                        </td>
                        <td class="align-middle text-break">${row.jenis_perkara ?? '-'}</td>
                        <td class="text-center align-middle">${tglPendaftaran}</td>
                        <td class="text-center align-middle">${tglPutusan}</td>
                        <td class="align-middle text-break">${jenisPutusan}</td>
                        <td class="align-middle text-break"><span>${nama}</span></td>
                        <td class="align-middle"><span>${usia}</span></td>
                    </tr>
                `;
			}).join('');

			$container.html(`
                <div class="table-responsive">
                    <table id="tabelPerkaraJinayatData"
                           class="table table-striped table-bordered table-hover align-middle">
                        <thead class="table-dark">
                            <tr>
                                <th class="text-center" style="width:4%">No</th>
                                <th>Nama Satker</th>
                                <th>Nomor Perkara</th>
                                <th>Jenis Jarimah</th>
                                <th class="text-center">Tgl. Masuk Perkara</th>
                                <th class="text-center">Tgl. Putus Perkara</th>
                                <th>Jenis Hukuman</th>
                                <th>Terdakwa</th>
                                <th class="text-center">Usia</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                        <tfoot class="table-light">
                            <tr>
                                <th colspan="9" class="text-end pe-3">
                                    Total Perkara:
                                    <span class="badge bg-dark fs-6">${data_jinayat.length}</span>
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `);

			// Inisialisasi DataTable dengan konfigurasi lengkap
			$('#tabelPerkaraJinayatData').DataTable({
				order: [[4, 'desc']],
				pageLength: 10,
				lengthMenu: [
					[10, 25, 50, 100],
					['10 baris', '25 baris', '50 baris', '100 baris']
				],
				dom:
					"<'row mt-2'<'col-sm-12'B>>" +
					"<'row mb-3'" +
					"  <'col-sm-12 col-md-4'd>" +
					"  <'col-sm-12 col-md-4'l>" +
					"  <'col-sm-12 col-md-4'f>" +
					">" +
					"<'row'<'col-sm-12'tr>>" +
					"<'row mt-2'" +
					"  <'col-sm-12 col-md-5'i>" +
					"  <'col-sm-12 col-md-7'p>" +
					">",
				buttons: [
					{
						extend: 'excelHtml5',
						text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
						title: 'Data Perkara Jinayat',
						className: 'btn btn-sm btn-outline-success me-2',
						exportOptions: {
							columns: ':visible',
							format: {
								body: (data) => {
									const temp = document.createElement('div');
									temp.innerHTML = data;
									return temp.textContent || temp.innerText || '';
								}
							}
						}
					},
					{
						extend: 'colvis',
						text: '<i class="bx bx-columns me-1"></i> Kolom',
						className: 'btn btn-sm btn-outline-secondary'
					}
				],
				language: {
					search: '',
					searchPlaceholder: 'Cari perkara...',
					lengthMenu: 'Tampilkan _MENU_',
					info: 'Menampilkan _START_ - _END_ dari _TOTAL_ perkara',
					infoEmpty: 'Tidak ada data',
					infoFiltered: '(difilter dari _MAX_ total perkara)',
					zeroRecords: 'Tidak ditemukan perkara yang sesuai',
					paginate: {
						first: '<i class="bx bx-chevrons-left"></i>',
						last: '<i class="bx bx-chevrons-right"></i>',
						next: '<i class="bx bx-chevron-right"></i>',
						previous: '<i class="bx bx-chevron-left"></i>'
					}
				},
				columnDefs: [
					{
						targets: 0,
						orderable: false,
						searchable: false,
						className: 'text-center'
					},
					{ targets: [4, 5], className: 'text-center' },
					{ targets: 8, className: 'text-center' }
				],
				drawCallback: function () {
					const api = this.api();
					api.column(0, { search: 'applied', order: 'applied', page: 'current' })
						.nodes()
						.each(function (cell, i) {
							cell.innerHTML = api.page.info().start + i + 1;
						});
				}
			});

		} catch (e) {
			console.error('Gagal parsing JSON:', e);
			$('#tabelPerkaraJinayat').html(
				`<div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bx bx-error-circle fs-4 me-2"></i>
                    <div>Gagal memuat data perkara jinayat. Silakan coba lagi.</div>
                </div>`
			);
		}
	});
}

// generator warna stabil berdasarkan ID perkara
function stringToColor(str) {
    let hash = 0;
    str = String(str);

    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    let h = hash % 360;
    if (h < 0) h += 360;

    return `hsl(${h}, 65%, 50%)`;
}

var chartJinayat = null;
function loadChartJinayat(kode_satker, tgl_awal = null, tgl_akhir = null) {

    $.ajax({
        url: 'get_chart_jinayat',
        type: "GET",
        data: { kode_satker: kode_satker, tgl_awal: tgl_awal, tgl_akhir: tgl_akhir },
        dataType: "json",

        beforeSend: function () {
            $("#chartPerkaraJinayat").html("<div class='text-center p-5'>Loading chart...</div>");
        },

        success: function (res) {

            $("#chartPerkaraJinayat").html("");

            // destroy chart lama
            if (chartJinayat !== null) {
                chartJinayat.destroy();
            }

            // =========================
            // OLAH DATA DARI SERVER
            // =========================
            let seriesData = [];
            let labelData  = [];
            let colorData  = [];
            let totalPerkara = 0;

            res.forEach(function(item) {

                let jumlah = parseInt(item.jumlah);

                seriesData.push(jumlah);
                labelData.push(item.nama);
                colorData.push(stringToColor(item.jenis_perkara_id));

                totalPerkara += jumlah;
            });

            // jika semua nol → cegah apex error
            if (totalPerkara === 0) {
                $("#chartPerkaraJinayat").html("<div class='text-center p-5 text-muted'>Tidak ada data</div>");
                return;
            }

            // =========================
            // OPTIONS APEXCHART
            // =========================
            var options = {
                series: seriesData,
                colors: colorData,

                chart: {
                    foreColor: '#9ba7b2',
                    height: 350,
                    type: 'donut'
                },

                labels: labelData,

                legend: {
                    position: 'bottom'
                },

                // DONUT TENGAH
                plotOptions: {
                    pie: {
                        donut: {
                            size: '70%',
                            labels: {
                                show: true,

                                name: {
                                    show: true,
                                    fontSize: '13px'
                                },

                                value: {
                                    show: true,
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    formatter: function (val) {
                                        return val + " perkara";
                                    }
                                },

                                total: {
                                    show: true,
                                    label: 'TOTAL PERKARA',
                                    fontSize: '14px',
                                    formatter: function () {
                                        return totalPerkara + " perkara";
                                    }
                                }
                            }
                        }
                    }
                },

                // PERSENTASE DI SLICE
                dataLabels: {
                    enabled: true,
                    formatter: function (val) {
                        return val.toFixed(1) + "%";
                    }
                },

                // TOOLTIP
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val + " perkara";
                        }
                    }
                }
            };

            chartJinayat = new ApexCharts(document.querySelector("#chartPerkaraJinayat"), options);
            chartJinayat.render();
        }
    });
}

function loadTabelPerkaraJinayatKasasi(kode, tgl_awal = null, tgl_akhir = null) {
	const postData = { kode, ...(tgl_awal && tgl_akhir && { tgl_awal, tgl_akhir }) };

	// Destroy DataTable lama jika sudah ada (mencegah reinit error)
	if ($.fn.DataTable.isDataTable('#tabelPerkaraJinayatKasasiData')) {
		$('#tabelPerkaraJinayatKasasiData').DataTable().destroy();
	}

	$.post('show_jinayat_kasasi', postData, function (response) {
		try {
			const { data_jinayat_kasasi } = JSON.parse(response);
			const $container = $('#tabelPerkaraJinayatKasasi').empty();

			// Cek data kosong
			if (!data_jinayat_kasasi?.length) {
				$container.html(`
                    <div class="row">
                        <div class="col">
                            <div class="alert border-0 border-start border-5 border-info py-2">
                                <div class="d-flex align-items-center">
                                    <div class="font-35 text-info"><i class="bx bx-info-square"></i></div>
                                    <div class="ms-3">
                                        <h6 class="mb-0 text-info">Informasi</h6>
                                        <div>Belum Ada Perkara Jinayat Kasasi, atau belum ada sinkronisasi ke satker daerah.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
				return;
			}

			// Helper: format tanggal agar lebih readable
			const formatTanggal = (tgl) => {
				if (!tgl) return null;
				const d = new Date(tgl);
				if (isNaN(d)) return tgl; // kembalikan string asli jika invalid
				return d.toLocaleDateString('id-ID', {
					day: '2-digit',
					month: 'short',
					year: 'numeric'
				});
			};

			// Helper: badge generator berdasarkan status
			const badgePutusan = (status) => {
				if (!status) return '<span class="badge bg-secondary bg-opacity-75">Tidak Disebutkan</span>';
				const s = status.toLowerCase();
				let badgeClass = 'bg-primary';
				if (s.includes('tolak') || s.includes('batal') || s.includes('pidana'))
					badgeClass = 'bg-danger';
				else if (s.includes('kabul') || s.includes('bebas') || s.includes('lepas'))
					badgeClass = 'bg-success';
				else if (s.includes('tidak dapat diterima') || s.includes('no'))
					badgeClass = 'bg-warning text-dark';
				return `<span class="badge ${badgeClass}">${status}</span>`;
			};

			// Build rows
			const rows = data_jinayat_kasasi.map((row, i) => {
				const tglPermohonan = formatTanggal(row.tanggal_permohonan_kasasi) || '-';
				const tglPutusan = row.tanggal_putusan_kasasi
					? formatTanggal(row.tanggal_putusan_kasasi)
					: '<span class="badge bg-secondary bg-opacity-75">Belum Putus</span>';
				const jenisPutusan = row.jenis_hukuman || '-';
				const jenisPutusanKasasi = badgePutusan(row.status_putusan_kasasi);
				const nama = row.nama_terdakwa || '<span class="text-muted fst-italic">Belum Ada Data</span>';
				const usia = row.usia
					? `<span class="badge bg-info bg-opacity-75 text-dark">${row.usia} th</span>`
					: '<span class="text-muted fst-italic">Belum Ada Data</span>';

				return `
                    <tr>
                        <td class="text-center align-middle">${i + 1}</td>
                        <td class="align-middle">
                            <small class="fw-semibold">${row.nama_satker ?? '-'}</small>
                        </td>
                        <td class="align-middle">
                            <span class="fw-semibold text-primary">${row.nomor_perkara ?? '-'}</span>
                        </td>
                        <td class="align-middle">${row.jenis_perkara ?? '-'}</td>
                        <td class="text-center align-middle text-nowrap">${tglPermohonan}</td>
                        <td class="text-center align-middle text-nowrap">${tglPutusan}</td>
                        <td class="align-middle">${jenisPutusan}</td>
                        <td class="text-center align-middle">${jenisPutusanKasasi}</td>
                        <td class="align-middle"><span>${nama}</span></td>
                        <td class="align-middle"><span>${usia}</span></td>
                    </tr>
                `;
			}).join('');

			$container.html(`
                <div class="table-responsive">
                    <table id="tabelPerkaraJinayatKasasiData"
                           class="table table-striped table-bordered table-hover align-middle"
                           style="width:100%">
                        <thead class="table-dark">
                            <tr>
                                <th class="text-center" style="width:45px">No</th>
                                <th>Nama Satker</th>
                                <th>Nomor Perkara Tk I</th>
                                <th>Jenis Jarimah</th>
                                <th class="text-center text-break">Tgl. Permohonan</th>
                                <th class="text-center">Tgl. Putusan Kasasi</th>
                                <th>Jenis Hukuman Tk I</th>
                                <th class="text-center">Status Kasasi</th>
                                <th>Terdakwa</th>
								<th>Usia</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                        <tfoot class="table-light">
                            <tr>
                                <th colspan="10" class="text-end pe-3">
                                    Total Perkara: 
                                    <span class="badge bg-dark fs-6">${data_jinayat_kasasi.length}</span>
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `);

			// Inisialisasi DataTable dengan konfigurasi lengkap
			$('#tabelPerkaraJinayatKasasiData').DataTable({
				order: [[4, 'desc']], // kolom ke-5 (Tgl Permohonan), index bergeser karena No
				pageLength: 10,
				lengthMenu: [
					[10, 25, 50, 100],
					['10 baris', '25 baris', '50 baris', '100 baris']
				],
				dom:
					"<'row mt-2'<'col-sm-12'B>>" +
					"<'row mb-3'" +
					"  <'col-sm-12 col-md-4'd>" +       // (kosong / info ringkas)
					"  <'col-sm-12 col-md-4'l>" +        // length menu di tengah
					"  <'col-sm-12 col-md-4'f>" +        // search di kanan
					">" +
					"<'row'<'col-sm-12'tr>>" +            // tabel
					"<'row mt-2'" +
					"  <'col-sm-12 col-md-5'i>" +        // info jumlah data
					"  <'col-sm-12 col-md-7'p>" +        // pagination
					">",

				buttons: [
					{
						extend: 'excelHtml5',
						text: '<i class="bx bx-spreadsheet me-1"></i> Export Excel',
						title: 'Data Perkara Jinayat Kasasi',
						className: 'btn btn-sm btn-outline-success me-2',
						exportOptions: {
							columns: ':visible',
							// Bersihkan HTML tags saat export
							format: {
								body: (data) => {
									const temp = document.createElement('div');
									temp.innerHTML = data;
									return temp.textContent || temp.innerText || '';
								}
							}
						}
					},
					{
						extend: 'colvis',
						text: '<i class="bx bx-columns me-1"></i> Kolom',
						className: 'btn btn-sm btn-outline-secondary'
					}
				],

				// Bahasa Indonesia
				language: {
					search: '',
					searchPlaceholder: 'Cari perkara...',
					lengthMenu: 'Tampilkan _MENU_',
					info: 'Menampilkan _START_ - _END_ dari _TOTAL_ perkara',
					infoEmpty: 'Tidak ada data',
					infoFiltered: '(difilter dari _MAX_ total perkara)',
					zeroRecords: 'Tidak ditemukan perkara yang sesuai',
					paginate: {
						first: '<i class="bx bx-chevrons-left"></i>',
						last: '<i class="bx bx-chevrons-right"></i>',
						next: '<i class="bx bx-chevron-right"></i>',
						previous: '<i class="bx bx-chevron-left"></i>'
					}
				},

				// Kolom "No" tidak ikut sort/search
				columnDefs: [
					{
						targets: 0,
						orderable: false,
						searchable: false,
						className: 'text-center'
					},
					{ targets: [4, 5], className: 'text-center' },
					{ targets: 7, className: 'text-center' }
				],

				// Highlight baris aktif
				drawCallback: function () {
					// Re-index nomor urut setelah sort/filter/paging
					const api = this.api();
					api.column(0, { search: 'applied', order: 'applied', page: 'current' })
						.nodes()
						.each(function (cell, i) {
							cell.innerHTML = api.page.info().start + i + 1;
						});
				}
			});

		} catch (e) {
			console.error('Gagal parsing JSON:', e);
			$('#tabelPerkaraJinayatKasasi').html(
				`<div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bx bx-error-circle fs-4 me-2"></i>
                    <div>Gagal memuat data perkara jinayat kasasi. Silakan coba lagi.</div>
                </div>`
			);
		}
	});
}
